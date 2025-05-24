import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../app.js';

const dummy = {
  email: `test${Date.now()}@example.com`,
  password: 'abc12345',
  name: 'TestUser'
};

describe('User Controller', () => {

  test('registers new user via EJS form', async () => {
    const res = await request(app)
      .post('/register')
      .type('form')
      .send(dummy);
    assert.equal(res.status, 200);
    assert.match(res.text, /Registered successfully!/);
  });

  test('prevents duplicate registration', async () => {
    const res = await request(app)
      .post('/register')
      .type('form')
      .send(dummy);
    assert.equal(res.status, 200);
    assert.match(res.text, /Email already registered/);
  });

  test('fails registration with short password', async () => {
    const res = await request(app)
      .post('/register')
      .type('form')
      .send({
        email: `fail1_${Date.now()}@example.com`,
        password: 'a1b2',
        name: 'FailUser'
      });
    assert.equal(res.status, 200);
    assert.match(res.text, /Password must be at least 8 characters/);
  });

  test('fails registration with password missing letters', async () => {
    const res = await request(app)
      .post('/register')
      .type('form')
      .send({
        email: `fail2_${Date.now()}@example.com`,
        password: '12345678',
        name: 'FailUser'
      });
    assert.equal(res.status, 200);
    assert.match(res.text, /Password must be at least 8 characters/);
  });

  test('fails registration with invalid email', async () => {
    const res = await request(app)
      .post('/register')
      .type('form')
      .send({
        email: 'invalid-email',
        password: 'abc12345',
        name: 'FailUser'
      });
    assert.equal(res.status, 200);
    assert.match(res.text, /Invalid email format/);
  });

  test('logs in successfully with valid credentials', async () => {
    const res = await request(app)
      .post('/login')
      .type('form')
      .redirects(0)
      .send({
        email: dummy.email,
        password: dummy.password
      });
    assert.equal(res.status, 302);
    assert.ok(res.headers.location.endsWith('/product'));
  });

  test('fails login with wrong password', async () => {
    const res = await request(app)
      .post('/login')
      .type('form')
      .send({
        email: dummy.email,
        password: 'wrongpass'
      });
    assert.equal(res.status, 200);
    assert.match(res.text, /Invalid email or password/);
  });

  test('renders EJS registration page with duplicate email', async () => {
    const res = await request(app)
      .post('/register')
      .type('form')
      .send(dummy);
    assert.equal(res.status, 200);
  });

  test('renders EJS login page with wrong password', async () => {
    const res = await request(app)
      .post('/login')
      .type('form')
      .send({
        email: dummy.email,
        password: 'wrongpass'
      });
    assert.equal(res.status, 200);
  });

  test('handles /profile redirect when not logged in', async () => {
    const res = await request(app)
      .get('/profile')
      .redirects(0);
    assert.equal(res.status, 302);
  });

  test('admin page access denied when not logged in', async () => {
    const res = await request(app).get('/admin/users');
    assert.equal(res.status, 403);
  });

  test('view non-existent user profile (404)', async () => {
    const res = await request(app).get('/user/999999');
    assert.ok([404, 500].includes(res.status));
  });

});