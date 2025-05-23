import { test, describe } from 'node:test';
import assert from 'node:assert';
import fetch from 'node-fetch';

const BASE = 'http://localhost:3000';

const dummy = {
  email: `test${Date.now()}@example.com`,
  password: 'abc12345',
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
    assert.strictEqual(res.status, 200);s
    assert.match(text, /Email already registered/);
  });

  test('fails registration with short password', async () => {
    const res = await fetch(`${BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        email: `fail1_${Date.now()}@example.com`,
        password: 'a1b2',  // too short
        name: 'FailUser'
      })
    });
    const text = await res.text();
    assert.strictEqual(res.status, 200);
    assert.match(text, /Password must be at least 8 characters/);
  });

  test('fails registration with password missing letters', async () => {
    const res = await fetch(`${BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        email: `fail2_${Date.now()}@example.com`,
        password: '12345678',
        name: 'FailUser'
      })
    });
    const text = await res.text();
    assert.strictEqual(res.status, 200);
    assert.match(text, /Password must be at least 8 characters/);
  });

  test('fails registration with invalid email', async () => {
    const res = await fetch(`${BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        email: `invalid-email`,
        password: 'abc12345',
        name: 'FailUser'
      })
    });
    const text = await res.text();
    assert.strictEqual(res.status, 200);
    assert.match(text, /Invalid email format/);
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