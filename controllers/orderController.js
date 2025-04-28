const { placeOrder } = require('./orderManager');
const cartController = require('./cartController');
module.exports = {
  placeOrder: (req, res) => {
    const cart = cartController.getCartInstance();
    const order = placeOrder({ userId: 'user42', items: cart.getCart() });
    cart.items = [];
    res.status(201).json(order);
  }
};