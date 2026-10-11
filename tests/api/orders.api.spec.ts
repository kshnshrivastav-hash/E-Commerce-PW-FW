import { test, expect } from '@playwright/test';
import { login, bearer, addToCart, shipping } from './helpers';

test.describe('Orders API (checkout)', () => {
  test('full flow: login, add items, checkout, verify order and empty cart', { tag: ['@smoke', '@api'] }, async ({ request }) => {
    const token = await login(request);
    await addToCart(request, token, 1);
    await addToCart(request, token, 2);

    const res = await request.post('/orders', { headers: bearer(token), data: shipping });
    expect(res.status()).toBe(201);
    const order = await res.json();
    expect(order.status).toBe('CONFIRMED');
    expect(order.items).toHaveLength(2);
    expect(order.subtotal).toBe(Number((29.99 + 9.99).toFixed(2)));

    const fetched = await request.get(`/orders/${order.id}`, { headers: bearer(token) });
    expect(fetched.status()).toBe(200);
    expect((await fetched.json()).id).toBe(order.id);

    const cart = await (await request.get('/cart', { headers: bearer(token) })).json();
    expect(cart.itemCount, 'cart must be empty after checkout').toBe(0);
  });

  test('order totals add up (subtotal + 8% tax = total)', { tag: '@api' }, async ({ request }) => {
    const token = await login(request);
    await addToCart(request, token, 4, 2);
    await addToCart(request, token, 5);
    const order = await (await request.post('/orders', { headers: bearer(token), data: shipping })).json();

    const expectedSubtotal = Number((2 * 49.99 + 7.99).toFixed(2));
    expect(order.subtotal).toBe(expectedSubtotal);
    expect(order.tax).toBe(Number((expectedSubtotal * 0.08).toFixed(2)));
    expect(order.total).toBe(Number((order.subtotal + order.tax).toFixed(2)));
  });

  test('checkout with an empty cart is rejected', { tag: ['@negative', '@api'] }, async ({ request }) => {
    const token = await login(request);
    const res = await request.post('/orders', { headers: bearer(token), data: shipping });
    expect(res.status()).toBe(409);
    expect((await res.json()).error).toBe('cart_empty');
  });

  const missing = [
    { name: 'first name is missing', field: 'firstName', data: { lastName: 'Rao', postalCode: '400001' } },
    { name: 'last name is missing', field: 'lastName', data: { firstName: 'Asha', postalCode: '400001' } },
    { name: 'postal code is missing', field: 'postalCode', data: { firstName: 'Asha', lastName: 'Rao' } },
    { name: 'first name is only spaces', field: 'firstName', data: { firstName: '   ', lastName: 'Rao', postalCode: '400001' } },
  ];

  for (const c of missing) {
    test(`checkout is blocked when ${c.name}`, { tag: ['@negative', '@api'] }, async ({ request }) => {
      const token = await login(request);
      await addToCart(request, token, 1);
      const res = await request.post('/orders', { headers: bearer(token), data: c.data });
      expect(res.status()).toBe(422);
      const body = await res.json();
      expect(body.error).toBe('missing_field');
      expect(body.field).toBe(c.field);
      const cart = await (await request.get('/cart', { headers: bearer(token) })).json();
      expect(cart.itemCount, 'a blocked checkout must keep the cart').toBe(1);
    });
  }

  test('a user cannot read another user\'s order', { tag: ['@negative', '@api'] }, async ({ request }) => {
    const owner = await login(request, 'standard_user');
    await addToCart(request, owner, 1);
    const order = await (await request.post('/orders', { headers: bearer(owner), data: shipping })).json();

    const other = await login(request, 'problem_user');
    const res = await request.get(`/orders/${order.id}`, { headers: bearer(other) });
    expect(res.status()).toBe(403);
    expect((await res.json()).error).toBe('forbidden');
  });

  test('unknown order id returns 404', { tag: ['@negative', '@api'] }, async ({ request }) => {
    const token = await login(request);
    const res = await request.get('/orders/ORD-0', { headers: bearer(token) });
    expect(res.status()).toBe(404);
  });

  test('order endpoints need a token', { tag: ['@negative', '@api'] }, async ({ request }) => {
    expect((await request.post('/orders', { data: shipping })).status()).toBe(401);
    expect((await request.get('/orders/ORD-5001')).status()).toBe(401);
  });
});
