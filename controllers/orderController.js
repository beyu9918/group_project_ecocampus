import { DataTypes }       from 'sequelize';
import { sequelize }       from '../config/database.js';
import { CartItem }        from './cartController.js';
import eventBus            from './eventBus.js';

// Order master table
export const Order = sequelize.define('orders', {
  id:        { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  user_id:   { type: DataTypes.INTEGER, allowNull: false },
  status:    { type: DataTypes.STRING, defaultValue: 'Pending' }
}, {
  timestamps: true,
  underscored: true,
});

// Line items
export const OrderItem = sequelize.define('order_items', {
  id:         { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  order_id:   { type: DataTypes.UUID, allowNull: false },
  product_id: { type: DataTypes.INTEGER, allowNull: false },
  quantity:   { type: DataTypes.INTEGER, allowNull: false },
  price_each: { type: DataTypes.DECIMAL(10,2), allowNull: false }
}, {
  timestamps: false,
  underscored: true,
});

Order.hasMany(OrderItem,  { foreignKey: 'order_id', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });

// Place an order: move items from cart_items to orders/order_items
export async function placeOrderHandler(req, res) {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId is required' });

  const cartItems = await CartItem.findAll({ where: { user_id: userId } });
  if (!cartItems.length) return res.status(400).json({ error: 'cart is empty' });

  const order = await Order.create({ user_id: userId });

  const lineItems = cartItems.map(ci => ({
    order_id:   order.id,
    product_id: ci.product_id,
    quantity:   ci.quantity,
    price_each: ci.price_each || 0 // assume product price lookup elsewhere
  }));

  await OrderItem.bulkCreate(lineItems);
  await CartItem.destroy({ where: { user_id: userId } });

  eventBus.emit('orderProcessed', { orderId: order.id, timestamp: new Date().toISOString() });
  res.status(201).json({ orderId: order.id });
}