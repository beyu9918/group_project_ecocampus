const path = require('path');
const { placeOrder } = require(path.join(__dirname, '../src/orderManager'));
module.exports = {
  placeOrder: (req, res) => {
    const cart = require('./cartController').getCartInstance();
    const order = placeOrder({ userId: 'user42', items: cart.getCart() });
    cart.items = [];
    res.status(201).json(order);
  }
};