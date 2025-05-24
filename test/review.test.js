import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fetch from 'node-fetch';

const BASE = 'http://localhost:3000';

describe('Review Controller (EJS)', () => {
  const testUser = {
    email: `test${Date.now()}@example.com`,
    password: 'abc12345',
    name: 'TestReviewer'
  };

  let cookie = '';

  test('Register and login user for review testing', async () => {
    const reg = await fetch(`${BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(testUser)
    });
    assert.strictEqual(reg.status, 200);

    const login = await fetch(`${BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      redirect: 'manual',
      body: new URLSearchParams({
        email: testUser.email,
        password: testUser.password
      })
    });

    assert.strictEqual(login.status, 302);
    cookie = login.headers.get('set-cookie');
    assert.ok(cookie);
  });

  test('Submit a review (should redirect)', async () => {
    const res = await fetch(`${BASE}/product/1/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookie
      },
      body: new URLSearchParams({
        rating: '5',
        comment: 'Great product from test!'
      }),
      redirect: 'manual'
    });
    assert.strictEqual(res.status, 302);
  });

  test('Fetch review page with session', async () => {
    const res = await fetch(`${BASE}/product/1/review`, {
      headers: { 'Cookie': cookie }
    });
    const text = await res.text();
    assert.strictEqual(res.status, 200);
    assert.match(text, /Great product from test!/);
  });

  test('Fail to submit duplicate review', async () => {
    const res = await fetch(`${BASE}/product/1/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookie
      },
      body: new URLSearchParams({
        rating: '4',
        comment: 'Trying to duplicate'
      })
    });
    const text = await res.text();
    assert.strictEqual(res.status, 400);
    assert.match(text, /already submitted/i);
  });

  test('Review submit fails without login', async () => {
    const res = await fetch(`${BASE}/product/1/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ rating: '5', comment: 'Should fail' }),
      redirect: 'manual'
    });
    assert.strictEqual(res.status, 302);
    assert.ok(res.headers.get('location').includes('/login'));
  });

  test('Submit review with invalid rating fails', async () => {
    const res = await fetch(`${BASE}/product/1/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookie
      },
      body: new URLSearchParams({
        rating: 'bad',
        comment: 'Invalid rating test'
      })
    });
    const text = await res.text();
    assert.strictEqual(res.status, 500);
    assert.match(text, /server error/i);
  });

  test('Fetch review for nonexistent product returns 404', async () => {
    const res = await fetch(`${BASE}/product/999999/review`, {
      headers: { 'Cookie': cookie },
      redirect: 'manual'
    });
    assert.strictEqual(res.status, 404);
  });

  test('Submit review with DB error fallback', async () => {
    const res = await fetch(`${BASE}/product/abc/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookie
      },
      body: new URLSearchParams({
        rating: '5',
        comment: 'Trigger fallback error'
      }),
      redirect: 'manual'
    });
    assert.ok([400, 500].includes(res.status));
  });
});