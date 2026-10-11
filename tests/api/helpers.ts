import { APIRequestContext, expect } from '@playwright/test';

export const PASSWORD = 'secret_sauce';

export async function login(request: APIRequestContext, username = 'standard_user'): Promise<string> {
  const res = await request.post('/auth/login', { data: { username, password: PASSWORD } });
  expect(res.status(), 'login should succeed').toBe(200);
  const body = await res.json();
  return body.token;
}

export const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });

export async function addToCart(request: APIRequestContext, token: string, productId: number, quantity = 1) {
  return request.post('/cart/items', { headers: bearer(token), data: { productId, quantity } });
}

export const shipping = { firstName: 'Asha', lastName: 'Rao', postalCode: '400001' };
