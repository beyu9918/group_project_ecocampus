import assert from 'node:assert';
import { test } from 'node:test';
import { registerForm, loginForm } from '../controllers/userController.js';

// emulate
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

  //should be successful return Registered successfully
  assert.ok(res.renderCalled, 'Render function should be called');
  assert.ok(res.data.message.includes('Registered successfully!'), 'Should show registration success message');
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
  const req = { body: { email: 'yuanliu92308687@gmail.com', password: '102910' } };
  const res = createMockRes();

  loginForm(req, res);

  // should login successful
  assert.ok(res.renderCalled, 'Render function should be called');
  assert.ok(res.data.message.includes('Welcome back'), 'Should show welcome message');
});
// It was designed for showitng a successful message after login, since it jump to the other page, this function no longer needed.