import eventBus from './eventBus.js';
export default class ShoppingCart {
  constructor() { this.items = []; }
  addItem(item) {
    this.items.push(item);
    eventBus.emit('cartItemAdded', item);
    eventBus.emit('notification', { type: 'cart', message: `Added '${item.name}' to cart` });
  }
  getCart() {
    return this.items;
  }
}
