import request from 'supertest';
import bcrypt from 'bcrypt';
import app from '../app.js';
import sql from '../db.js';
import assert from 'node:assert';
import { test } from 'node:test';
import { registerForm, loginForm } from '../../controllers/userController.js';

const testEmail = 'testuser@example.com';
const testPassword = 'test123';
const testName = 'Test User';

describe('User Controller Full Flow', () => {
  beforeAll(async () => {
    // Make sure database is clean
    await sql`DELETE FROM users WHERE email = ${testEmail}`;
  });

  afterAll(async () => {
    // Clean again and reconnect
    await sql`DELETE FROM users WHERE email = ${testEmail}`;
  });

  test('POST /register - should register a new user', async () => {
    const res = await request(app)
      .post('/register')
      .send({
        email: testEmail,
        password: testPassword,
        name: testName
      });

    expect(res.statusCode).toBe(200); // register successful page
    expect(res.text).toContain('Registered successfully');
  });

  test('User should be stored in database with hashed password', async () => {
    const result = await sql`SELECT * FROM users WHERE email = ${testEmail}`;
    const user = result[0];

    expect(user).toBeDefined();
    expect(user.email).toBe(testEmail);
    expect(user.name).toBe(testName);
    expect(user.password).not.toBe(testPassword); // Make sure it is hash
    expect(bcrypt.compareSync(testPassword, user.password)).toBe(true);
  });

  test('POST /login - should succeed with correct credentials', async () => {
    const res = await request(app)
      .post('/login')
      .send({
        email: testEmail,
        password: testPassword
      });

    // loginForm will redirect to profile
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('/profile');
  });

  test('POST /login - should fail with wrong password', async () => {
    const res = await request(app)
      .post('/login')
      .send({
        email: testEmail,
        password: 'wrongpassword'
      });

    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Invalid email or password');
  });

  test('GET /profile - should redirect when not logged in', async () => {
    const res = await request(app)
      .get('/profile');

    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('/login');
  });

  test('User avatar should be null or empty after registration', async () => {
    const result = await sql`SELECT * FROM users WHERE email = ${testEmail}`;
    const avatar = result[0].avatar;
    expect(avatar === null || avatar === '' || avatar === 'None').toBe(true);
  });
});