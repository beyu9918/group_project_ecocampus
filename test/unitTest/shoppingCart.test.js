import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import ShoppingCart from '../../controllers/shoppingCart.js';
import eventBus from '../../controllers/eventBus.js';

describe('ShoppingCart', () => {
  let cart;
  beforeEach(() => { cart = new ShoppingCart(); });

  test('initial cart is empty', () => {
    assert.deepEqual(cart.getCart(), []);
  });

  test('addItem adds item and emits cartItemAdded event', async () => {
    const item = { id: '1', name: 'Test Item' };
    await new Promise(resolve => {
      eventBus.once('cartItemAdded', emitted => {
        assert.deepEqual(emitted, item);
        resolve();
      });
      cart.addItem(item);
    });
    assert.deepEqual(cart.getCart()[0], item);
  });
});