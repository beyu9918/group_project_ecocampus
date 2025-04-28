import eventBus from './eventBus.js';

// Helper to get 24-hour timestamp in Australia/Sydney timezone
function getTimestamp() {
  return new Date().toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    timeZone: 'Australia/Sydney'
  });
}


export default class ShoppingCart {
  constructor() { this.items = []; }
  addItem(item) {
    const timestamp = getTimestamp();
    this.items.push(item);
    eventBus.emit('cartItemAdded', { item, timestamp });
    eventBus.emit('notification', { type: 'cart', message: `Added '${item.name}' to cart`, timestamp });
  }
  getCart() {
    return this.items;
  }
}
