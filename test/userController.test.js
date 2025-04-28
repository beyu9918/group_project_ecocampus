import assert from 'node:assert';
import { test } from 'node:test';
import { registerForm, loginForm } from '../controllers/userController.js';

// 模拟响应对象
function createMockRes() {
  return {
    renderCalled: false,
    data: {},
    render(view, data) {
      this.renderCalled = true;
      this.data = data;
    }
  };
}

test('Register Form - Should Succeed if email not exists', () => {
  const uniqueEmail = `user${Date.now()}@example.com`;
  
  const req = { body: { email: uniqueEmail, password: 'password123', name: 'UniqueUser' } };
  const res = createMockRes();

  registerForm(req, res);

  // 应该注册成功，返回注册成功的提示
  assert.ok(res.renderCalled, 'Render function should be called');
  assert.ok(res.data.message.includes('✅ Registered successfully'), 'Should show registration success message');
});

test('Login Form - Should Fail if wrong credentials', () => {
  const req = { body: { email: 'nonexistent@example.com', password: 'wrongpassword' } };
  const res = createMockRes();

  loginForm(req, res);

  // should show invalid email or password
  assert.ok(res.renderCalled, 'Render function should be called');
  assert.ok(res.data.message.includes('Invalid email or password'), 'Should show invalid login message');
});

test('Login Form - Should Succeed if credentials correct', () => {
  // require tester to create a user
  const req = { body: { email: 'test@example.com', password: '123456' } };
  const res = createMockRes();

  loginForm(req, res);

  // should login successful
  assert.ok(res.renderCalled, 'Render function should be called');
  assert.ok(res.data.message.includes('Welcome back'), 'Should show welcome message');
});