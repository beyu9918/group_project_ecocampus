import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import request from 'supertest';
import orderRoutes from '../routes/order.js';
import * as cartController from '../controllers/cartController.js';

describe('Order API', () => {
  let app;
  before(() => {
    app = express();
    app.use(express.json());
    app.use('/api/order', orderRoutes);
    // prepare cart
    const cart = cartController.getCartInstance(); cart.items = [{ id: '1', name: 'Item1' }];
  });

  test('POST /api/order processes order and clears cart', async () => {
    const res = await request(app)
      .post('/api/order')
      .set('Content-Type', 'application/json');
    assert.equal(res.status, 201);
    assert.ok(res.body.id);
    const cart = cartController.getCartInstance();
    assert.deepEqual(cart.getCart(), []);
  });
});