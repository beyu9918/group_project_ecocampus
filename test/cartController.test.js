import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import request from 'supertest';
import session from 'express-session';
import * as cartController from '../controllers/cartController.js';

// Set up Express app
const app = express();
app.use(express.json());
app.use(session({ secret: 'test-secret', resave: false, saveUninitialized: true }));

// Mount getCart route
app.get('/api/cart', cartController.getCart);

// Test: GET /api/cart without buyerID should return 400
test('GET /api/cart without buyerID returns 400', async () => {
  const res = await request(app).get('/api/cart');
  assert.strictEqual(res.status, 400);
  assert.deepStrictEqual(res.body, { error: 'buyerID query required' });
});

// Test: GET /api/cart with invalid buyerID should return 400
test('GET /api/cart with invalid buyerID returns 400', async () => {
  const res = await request(app).get('/api/cart?buyerID=abc');
  assert.strictEqual(res.status, 400);
  assert.deepStrictEqual(res.body, { error: 'buyerID query required' });
});
