const path = require('path');
const ShoppingCart = require(path.join(__dirname, '../src/shoppingCart'));
const eventBus = require(path.join(__dirname, '../src/eventBus'));
// singleton
const cart = new ShoppingCart();
module.exports = {
  getCartInstance: () => cart,
  getCart: (req, res) => res.json(cart.getCart()),
  addCartItem: (req, res) => {
    cart.addItem(req.body);
    res.status(201).json(cart.getCart());
  }
};
