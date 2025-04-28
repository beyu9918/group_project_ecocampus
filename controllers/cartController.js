import ShoppingCart from './shoppingCart.js';
const cart = new ShoppingCart();
export function getCartInstance() { return cart; }
export function getCart(req, res) { res.json(cart.getCart()); }
export function addCartItem(req, res) {
  cart.addItem(req.body);
  res.status(201).json(cart.getCart());
}