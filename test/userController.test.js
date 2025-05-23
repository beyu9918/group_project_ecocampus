import { test, describe } from 'node:test';
import assert from 'node:assert';
import fetch from 'node-fetch';

const BASE = 'http://localhost:3000';

const dummy = {
  email: `test${Date.now()}@example.com`,
  password: '123456',
  name: 'TestUser'
};

describe('User Controller', () => {
  
  test('registers new user via EJS form', async () => {
    const res = await fetch(`${BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(dummy)
    });
    const text = await res.text();
    assert.strictEqual(res.status, 200);
    assert.match(text, /Registered successfully!/);
  });

  test('prevents duplicate registration', async () => {
    const res = await fetch(`${BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(dummy)
    });
    const text = await res.text();
    assert.strictEqual(res.status, 200);
    assert.match(text, /Email already registered/);
  });

  test('logs in successfully with valid credentials', async () => {
  const res = await fetch(`${BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    redirect: 'manual',
    body: new URLSearchParams({
      email: dummy.email,
      password: dummy.password
    })
  });
  assert.strictEqual(res.status, 302);
  assert.ok(res.headers.get('location').endsWith('/product'));
});

  test('fails login with wrong password', async () => {
    const res = await fetch(`${BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        email: dummy.email,
        password: 'wrongpass'
      })
    });
    const text = await res.text();
    assert.strictEqual(res.status, 200);
    assert.match(text, /Invalid email or password/);
  });

  test('renders EJS registration page with duplicate email', async () => {
    const res = await fetch(`${BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(dummy)
    });
    assert.strictEqual(res.status, 200);
  });

  test('renders EJS login page with wrong password', async () => {
    const res = await fetch(`${BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        email: dummy.email,
        password: 'wrongpass'
      })
    });
    assert.strictEqual(res.status, 200);
  });

  test('handles /profile redirect when not logged in', async () => {
    const res = await fetch(`${BASE}/profile`, {
      method: 'GET',
      redirect: 'manual'
    });
    assert.strictEqual(res.status, 302);
  });

  test('admin page access denied when not logged in', async () => {
    const res = await fetch(`${BASE}/admin/users`, { method: 'GET' });
    assert.strictEqual(res.status, 403);
  });

  test('view non-existent user profile (404)', async () => {
    const res = await fetch(`${BASE}/user/999999`, { method: 'GET' });
    assert.ok([404, 500].includes(res.status));
  });
});