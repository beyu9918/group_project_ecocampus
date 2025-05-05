import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import eventBus from '../../controllers/eventBus.js';
import { placeOrder } from '../../controllers/orderManager.js';

describe('OrderManager', () => {
  test('placeOrder returns an order with id and emits orderProcessed', async () => {
    const orderData = { userId: 'user1', items: [] };
    await new Promise(resolve => {
      eventBus.once('orderProcessed', status => {
        assert.ok(status.orderId);
        assert.equal(status.status, 'Processed');
        resolve();
      });
      const order = placeOrder(orderData);
      assert.ok(order.id);
      assert.equal(order.userId, 'user1');
    });
  });
});