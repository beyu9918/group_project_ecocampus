const eventBus = require('./eventBus');
class ShoppingCart {
  constructor() { this.items = []; }
  addItem(item) { this.items.push(item); eventBus.emit('cartItemAdded', item); }
  removeItem(itemId) { this.items = this.items.filter(i => i.id !== itemId); eventBus.emit('cartItemRemoved', { itemId }); }
  getCart() { return this.items; }
}
module.exports = ShoppingCart;