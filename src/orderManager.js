const eventBus = require('./eventBus');
eventBus.on('orderPlaced', order => eventBus.emit('orderProcessed', { orderId: order.id, status: 'Processed' }));
function placeOrder(orderData) { orderData.id = Date.now().toString(); eventBus.emit('orderPlaced', orderData); return orderData; }
module.exports = { placeOrder };