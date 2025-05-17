import { DataTypes } from 'sequelize';
import { sequelize }  from '../config/database.js';
import eventBus       from './eventBus.js';

// Map to `cart` table exactly as-is
export const Cart = sequelize.define('cart', {
  cartID: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: 'cartid'              // ← exactly your existing column
  },
  buyerID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'buyerid',            // ← map to buyerid, not buyer_i_d
    references: { model: 'users', key: 'userid' },
    onDelete: 'CASCADE'
  },
  productID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'productid',          // ← map to productid
    references: { model: 'product', key: 'productid' },
    onDelete: 'CASCADE'
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  }
}, {
  tableName:    'cart',
  timestamps:   true,
  createdAt:    'added_at',
  updatedAt:    false,
  underscored:  false           // ← turn OFF automatic snake_casing
});

// GET /api/cart?buyerID=...
export async function getCart(req, res) {
  const buyerID = parseInt(req.query.buyerID, 10);
  if (!buyerID) return res.status(400).json({ error: 'buyerID query required' });
  const items = await Cart.findAll({ where: { buyerID } });
  res.json(items);
}

// POST /api/cart
// body: { buyerID, productID, quantity }
export async function addCartItem(req, res) {
  const { buyerID, productID, quantity = 1 } = req.body;
  if (!buyerID || !productID) {
    return res.status(400).json({ error: 'buyerID and productID required' });
  }
  const item = await Cart.create({ buyerID, productID, quantity });
  eventBus.emit('cartItemAdded', { item, timestamp: new Date().toISOString() });
  res.status(201).json(item);
}