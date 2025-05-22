import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import fetch from 'node-fetch';

// 基础设置
const BASE = 'http://localhost:3000';

const dummy = {
  email: `test${Date.now()}@example.com`,
  password: '123456',
  name: 'TestUser'
};

describe('User Controller', () => {
  test('registers new user via JSON API', async () => {
    const res = await fetch(`${BASE}/api/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dummy)
    });
    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.match(data.msg, /User registered successfully/);
  });

  test('prevents duplicate registration', async () => {
    const res = await fetch(`${BASE}/api/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dummy)
    });
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.match(data.msg, /already exists/);
  });

  test('logs in successfully with valid credentials', async () => {
    const res = await fetch(`${BASE}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: dummy.email,
        password: dummy.password
      })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.match(data.msg, /Login successful/);
    assert.ok(data.token);
  });

  test('fails login with wrong password', async () => {
    const res = await fetch(`${BASE}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: dummy.email,
        password: 'wrongpass'
      })
    });
    assert.strictEqual(res.status, 401);
    const data = await res.json();
    assert.match(data.msg, /Invalid credentials/);
  });

  // 触发 EJS 路由（仅为覆盖 render 路径）
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

  // Profile 页面仅验证是否返回
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
    // 可能是 404 或 500，视你的 renderUserPage 实现而定
    assert.ok([404, 500].includes(res.status));
  });
});