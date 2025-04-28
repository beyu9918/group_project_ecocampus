import { test } from 'node:test';
import assert from 'node:assert/strict';
import eventBus from '../controllers/eventBus.js';

test('EventBus emits and listens', async () => {
  const data = { foo: 'bar' };
  await new Promise(resolve => {
    eventBus.once('testEvent', val => {
      assert.deepEqual(val, data);
      resolve();
    });
    eventBus.emit('testEvent', data);
  });
});