import { DataTypes } from 'sequelize';
import { sequelize }  from '../config/database.js';
import { Cart }      from './cartController.js';
import eventBus       from './eventBus.js';

// Map to `orders` table
export const Order = sequelize.define('orders', {
  orderID:     { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  buyerID:     { type: DataTypes.INTEGER, allowNull: false },
  productID:   { type: DataTypes.INTEGER, allowNull: false },
  totalAmount: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Pending' },
}, {
  tableName: 'orders',
  timestamps: true,
  createdAt: 'placed_at',
  updatedAt: false,
  underscored: true
});

// POST /api/order
// body: { buyerID, productID, totalAmount }
export async function placeOrderHandler(req, res) {
  const { buyerID, productID, totalAmount } = req.body;
  if (!buyerID || !productID || !totalAmount) {
    return res.status(400).json({ error: 'buyerID, productID, totalAmount required' });
  }
  // Create order
  const order = await Order.create({ buyerID, productID, totalAmount });
  // Clear cart for this buyer/product
  await Cart.destroy({ where: { buyerID, productID } });
  eventBus.emit('orderProcessed', { order, timestamp: new Date().toISOString() });
  res.status(201).json({ orderID: order.orderID });
}

export async function payOrderHandler(req, res) {
  const { orderID } = req.params;
  await Order.update({ status: 'Done' }, { where: { orderID } });
  res.json({ success: true });
}