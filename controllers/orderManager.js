import eventBus from './eventBus.js';

eventBus.on('orderPlaced', order => {
  eventBus.emit('orderProcessed', { orderId: order.id, status: 'Processed' });
  eventBus.emit('notification', { type: 'order', message: `Order ${order.id} processed` });
});

export function placeOrder(orderData) {
  orderData.id = Date.now().toString();
  eventBus.emit('orderPlaced', orderData);
  return orderData;
}