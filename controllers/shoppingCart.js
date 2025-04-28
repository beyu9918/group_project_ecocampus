const eventBus = require('./eventBus');
class ShoppingCart {
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
module.exports = ShoppingCart;