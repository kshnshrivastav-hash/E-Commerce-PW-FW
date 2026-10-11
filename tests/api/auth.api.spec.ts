import { test, expect } from '@playwright/test';
import { login, bearer, PASSWORD } from './helpers';

test.describe('Authentication API', () => {
  test('valid login returns a token', { tag: ['@smoke', '@api'] }, async ({ request }) => {
    const res = await request.post('/auth/login', { data: { username: 'standard_user', password: PASSWORD } });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.token).toMatch(/^tok_/);
    expect(body.username).toBe('standard_user');
  });

  const badLogins = [
    { name: 'wrong password', data: { username: 'standard_user', password: 'wrong' }, status: 401, error: 'invalid_credentials' },
    { name: 'unknown user', data: { username: 'nobody', password: PASSWORD }, status: 401, error: 'invalid_credentials' },
    { name: 'locked out user', data: { username: 'locked_out_user', password: PASSWORD }, status: 403, error: 'user_locked_out' },
    { name: 'empty password', data: { username: 'standard_user', password: '' }, status: 400, error: 'username_and_password_required' },
    { name: 'missing username', data: { password: PASSWORD }, status: 400, error: 'username_and_password_required' },
    { name: 'empty body', data: {}, status: 400, error: 'username_and_password_required' },
  ];

  for (const c of badLogins) {
    test(`login rejected: ${c.name}`, { tag: ['@negative', '@api'] }, async ({ request }) => {
      const res = await request.post('/auth/login', { data: c.data });
      expect(res.status()).toBe(c.status);
      expect((await res.json()).error).toBe(c.error);
    });
  }

  test('malformed JSON body returns 400', { tag: ['@negative', '@api'] }, async ({ request }) => {
    const res = await request.post('/auth/login', {
      headers: { 'Content-Type': 'application/json' },
      data: '{"username": "standard_user", ',
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toBe('invalid_json');
  });

  test('protected endpoint without a token returns 401', { tag: ['@negative', '@api'] }, async ({ request }) => {
    const res = await request.get('/cart');
    expect(res.status()).toBe(401);
    expect((await res.json()).error).toBe('missing_token');
  });

  test('protected endpoint with an invalid token returns 401', { tag: ['@negative', '@api'] }, async ({ request }) => {
    const res = await request.get('/cart', { headers: bearer('tok_not_a_real_token') });
    expect(res.status()).toBe(401);
    expect((await res.json()).error).toBe('invalid_token');
  });

  test('token without the Bearer prefix is rejected', { tag: ['@negative', '@api'] }, async ({ request }) => {
    const token = await login(request);
    const res = await request.get('/cart', { headers: { Authorization: token } });
    expect(res.status()).toBe(401);
  });
});
