import { DataTypes }       from 'sequelize';
import { sequelize }       from '../config/database.js';
import eventBus            from './eventBus.js';

// Inline model mapping to cart_items table
export const CartItem = sequelize.define('cart_items', {
  id:         { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  user_id:    { type: DataTypes.INTEGER, allowNull: false },
  product_id: { type: DataTypes.INTEGER, allowNull: false },
  quantity:   { type: DataTypes.INTEGER, defaultValue: 1 }
}, {
  timestamps: true,
  underscored: true,
});

// Get all items in a user's cart
export async function getCart(req, res) {
  const userId = parseInt(req.query.userId, 10) || null;
  if (!userId) return res.status(400).json({ error: 'userId query is required' });

  const items = await CartItem.findAll({ where: { user_id: userId } });
  res.json(items);
}

// Add a product to cart
export async function addCartItem(req, res) {
  const { userId, productId, quantity = 1 } = req.body;
  if (!userId || !productId) {
    return res.status(400).json({ error: 'userId and productId are required' });
  }

  const item = await CartItem.create({ user_id: userId, product_id: productId, quantity });
  eventBus.emit('cartItemAdded', { item, timestamp: new Date().toISOString() });
  res.status(201).json(item);
}