import eventBus from './eventBus.js';

// Helper to get 24-hour timestamp in Australia/Sydney timezone
function getTimestamp() {
  return new Date().toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    timeZone: 'Australia/Sydney'
  });
}


eventBus.on('orderPlaced', order => {
  const timestamp = getTimestamp();
  eventBus.emit('orderProcessed', { orderId: order.id, status: 'Processed', timestamp });
  eventBus.emit('notification', { type: 'order', message: `Order ${order.id} processed`, timestamp });
});

export function placeOrder(orderData) {
  orderData.id = Date.now().toString();
  eventBus.emit('orderPlaced', orderData);
  return orderData;
}