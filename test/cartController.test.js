import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import request from 'supertest';
import cartRoutes from '../routes/cart.js';
import * as cartController from '../controllers/cartController.js';

describe('Cart API', () => {
  let app;
  before(() => {
    app = express();
    app.use(express.json());
    app.use('/api/cart', cartRoutes);
    // reset in-memory cart
    const cart = cartController.getCartInstance(); cart.items = [];
  });

  test('GET /api/cart returns empty array', async () => {
    const res = await request(app).get('/api/cart');
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, []);
  });

  test('POST /api/cart adds item', async () => {
    const newItem = { id: '42', name: 'Book' };
    const res = await request(app)
      .post('/api/cart')
      .send(newItem)
      .set('Content-Type', 'application/json');
    assert.equal(res.status, 201);
    assert.deepEqual(res.body[0], newItem);
  });
});