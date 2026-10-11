import { test, expect } from '@playwright/test';
import { login, bearer, addToCart } from './helpers';

test.describe('Cart API', () => {
  test('new session starts with an empty cart', { tag: '@api' }, async ({ request }) => {
    const token = await login(request);
    const cart = await (await request.get('/cart', { headers: bearer(token) })).json();
    expect(cart.items).toEqual([]);
    expect(cart.itemCount).toBe(0);
    expect(cart.subtotal).toBe(0);
  });

  test('add, update and remove items (request chaining)', { tag: ['@smoke', '@api'] }, async ({ request }) => {
    const token = await login(request);

    const first = await addToCart(request, token, 1);
    expect(first.status()).toBe(201);
    expect((await first.json()).itemCount).toBe(1);

    const second = await addToCart(request, token, 2, 2);
    const cart = await second.json();
    expect(cart.itemCount).toBe(3);
    expect(cart.subtotal).toBe(Number((29.99 + 2 * 9.99).toFixed(2)));

    const removed = await request.delete('/cart/items/1', { headers: bearer(token) });
    expect(removed.status()).toBe(200);
    const after = await (await request.get('/cart', { headers: bearer(token) })).json();
    expect(after.items.map((i: { productId: number }) => i.productId)).toEqual([2]);
  });

  test('adding the same product twice increases the quantity', { tag: '@api' }, async ({ request }) => {
    const token = await login(request);
    await addToCart(request, token, 3, 2);
    const cart = await (await addToCart(request, token, 3, 3)).json();
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].quantity).toBe(5);
  });

  test('carts are separate for each session', { tag: '@api' }, async ({ request }) => {
    const tokenA = await login(request, 'standard_user');
    const tokenB = await login(request, 'problem_user');
    await addToCart(request, tokenA, 1);
    const cartB = await (await request.get('/cart', { headers: bearer(tokenB) })).json();
    expect(cartB.itemCount).toBe(0);
  });

  const badAdds = [
    { name: 'zero quantity', body: { productId: 1, quantity: 0 }, status: 422, error: 'invalid_quantity' },
    { name: 'negative quantity', body: { productId: 1, quantity: -1 }, status: 422, error: 'invalid_quantity' },
    { name: 'quantity above the limit', body: { productId: 1, quantity: 11 }, status: 422, error: 'invalid_quantity' },
    { name: 'decimal quantity', body: { productId: 1, quantity: 1.5 }, status: 422, error: 'invalid_quantity' },
    { name: 'text quantity', body: { productId: 1, quantity: 'two' }, status: 422, error: 'invalid_quantity' },
    { name: 'unknown product', body: { productId: 999, quantity: 1 }, status: 404, error: 'product_not_found' },
    { name: 'missing product id', body: { quantity: 1 }, status: 404, error: 'product_not_found' },
  ];

  for (const c of badAdds) {
    test(`rejects ${c.name}`, { tag: ['@negative', '@api'] }, async ({ request }) => {
      const token = await login(request);
      const res = await request.post('/cart/items', { headers: bearer(token), data: c.body });
      expect(res.status()).toBe(c.status);
      expect((await res.json()).error).toBe(c.error);
      const cart = await (await request.get('/cart', { headers: bearer(token) })).json();
      expect(cart.itemCount, 'a rejected request must not change the cart').toBe(0);
    });
  }

  test('total quantity of one product cannot pass the limit', { tag: ['@negative', '@api'] }, async ({ request }) => {
    const token = await login(request);
    await addToCart(request, token, 1, 8);
    const res = await addToCart(request, token, 1, 3);
    expect(res.status()).toBe(422);
    expect((await res.json()).error).toBe('quantity_limit_exceeded');
  });

  test('removing an item that is not in the cart returns 404', { tag: ['@negative', '@api'] }, async ({ request }) => {
    const token = await login(request);
    const res = await request.delete('/cart/items/4', { headers: bearer(token) });
    expect(res.status()).toBe(404);
    expect((await res.json()).error).toBe('item_not_in_cart');
  });

  test('cart endpoints need a token', { tag: ['@negative', '@api'] }, async ({ request }) => {
    expect((await request.post('/cart/items', { data: { productId: 1, quantity: 1 } })).status()).toBe(401);
    expect((await request.delete('/cart/items/1')).status()).toBe(401);
  });
});
