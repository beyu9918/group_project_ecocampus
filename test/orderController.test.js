import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import request from 'supertest';
import session from 'express-session';
import * as orderController from '../controllers/orderController.js';

// Set up Express app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({ secret: 'test-secret', resave: false, saveUninitialized: true }));

// Mount placeOrderHandler route at /order
app.post('/order', orderController.placeOrderHandler);

// Test: POST /order without login should redirect to /login
test('POST /order without login redirects to /login', async () => {
  const res = await request(app)
    .post('/order')
    .send({ productID: 1, totalAmount: 100 });
  assert.strictEqual(res.status, 302);
  assert.strictEqual(res.headers.location, '/login');
});

// Test: POST /order with missing fields returns 400
test('POST /order with missing fields returns 400', async () => {
  // simulate login
  const agent = request.agent(app);
  await agent.post('/login').send({}); // assume login endpoint exists
  // directly set session user
  app.use((req, res, next) => { req.session.user = { userid: 1 }; next(); });

  const res = await request(app)
    .post('/order')
    .send({});
  assert.strictEqual(res.status, 400);
});
