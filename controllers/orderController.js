import { placeOrder } from './orderManager.js';
import { getCartInstance } from './cartController.js';
export function placeOrderHandler(req, res) {
  const cart = getCartInstance();
  const order = placeOrder({ userId: 'user42', items: cart.getCart() });
  cart.items = [];
  res.status(201).json(order);
}