import { DataTypes } from 'sequelize';
import { sequelize }  from '../config/database.js';
import { Cart }       from './cartController.js';
import eventBus       from './eventBus.js';

export const Order = sequelize.define('orders', {
  orderID: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: 'orderid'
  },
  buyerID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'buyerid',
    references: { model: 'users', key: 'userid' },
    onDelete: 'CASCADE'
  },
  productID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'productid',
    references: { model: 'product', key: 'productid' },
    onDelete: 'CASCADE'
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: false,
    field: 'totalamount'
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Pending'
  }
}, {
  tableName:    'orders',
  timestamps:   true,
  createdAt:    'placed_at',
  updatedAt:    false,
  underscored:  false
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