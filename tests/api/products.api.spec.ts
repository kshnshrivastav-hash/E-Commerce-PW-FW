import { test, expect } from '@playwright/test';

interface Product { id: number; name: string; price: number }

test.describe('Products API', () => {
  test('lists all products with the expected fields', { tag: ['@smoke', '@api'] }, async ({ request }) => {
    const res = await request.get('/products');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.total).toBe(6);
    for (const p of body.items as Product[]) {
      expect(typeof p.id).toBe('number');
      expect(typeof p.name).toBe('string');
      expect(p.price).toBeGreaterThan(0);
    }
  });

  test('gets one product by id', { tag: '@api' }, async ({ request }) => {
    const res = await request.get('/products/1');
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ id: 1, name: 'Sauce Labs Backpack', price: 29.99 });
  });

  test('sorts by price ascending and descending', { tag: '@api' }, async ({ request }) => {
    const asc = (await (await request.get('/products?sort=price&order=asc')).json()).items as Product[];
    const prices = asc.map((p) => p.price);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));

    const desc = (await (await request.get('/products?sort=price&order=desc')).json()).items as Product[];
    const pricesDesc = desc.map((p) => p.price);
    expect(pricesDesc).toEqual([...pricesDesc].sort((a, b) => b - a));
  });

  test('searches by name, ignoring case', { tag: '@api' }, async ({ request }) => {
    const body = await (await request.get('/products?q=t-shirt')).json();
    expect(body.total).toBe(2);
    for (const p of body.items as Product[]) {
      expect(p.name.toLowerCase()).toContain('t-shirt');
    }
  });

  test('search with no match returns an empty list', { tag: '@api' }, async ({ request }) => {
    const body = await (await request.get('/products?q=zzzz')).json();
    expect(body.total).toBe(0);
    expect(body.items).toEqual([]);
  });

  test('pagination returns the right slice', { tag: '@api' }, async ({ request }) => {
    const body = await (await request.get('/products?limit=2&offset=2')).json();
    expect(body.total).toBe(6);
    expect(body.items.map((p: Product) => p.id)).toEqual([3, 4]);
  });

  test('unknown product id returns 404', { tag: ['@negative', '@api'] }, async ({ request }) => {
    const res = await request.get('/products/9999');
    expect(res.status()).toBe(404);
    expect((await res.json()).error).toBe('product_not_found');
  });

  test('non-numeric product id returns 404', { tag: ['@negative', '@api'] }, async ({ request }) => {
    const res = await request.get('/products/abc');
    expect(res.status()).toBe(404);
  });

  const badQueries = [
    { name: 'unknown sort field', url: '/products?sort=color', error: 'invalid_sort' },
    { name: 'unknown sort order', url: '/products?sort=price&order=sideways', error: 'invalid_sort' },
    { name: 'negative offset', url: '/products?offset=-1', error: 'invalid_pagination' },
    { name: 'zero limit', url: '/products?limit=0', error: 'invalid_pagination' },
    { name: 'text limit', url: '/products?limit=many', error: 'invalid_pagination' },
  ];

  for (const c of badQueries) {
    test(`rejects ${c.name}`, { tag: ['@negative', '@api'] }, async ({ request }) => {
      const res = await request.get(c.url);
      expect(res.status()).toBe(400);
      expect((await res.json()).error).toBe(c.error);
    });
  }
});
