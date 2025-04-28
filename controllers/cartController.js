const ShoppingCart = require('./shoppingCart');
const cart = new ShoppingCart();
module.exports = {
  getCartInstance: () => cart,
  getCart:        (req, res) => res.json(cart.getCart()),
  addCartItem:    (req, res) => {
    cart.addItem(req.body);
    res.status(201).json(cart.getCart());
  }
};