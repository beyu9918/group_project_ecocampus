// controllers/cartController.js
import { DataTypes } from 'sequelize';
import { sequelize }  from '../config/database.js';
import { Product }    from './productController.js';
import eventBus       from './eventBus.js';

// Define Cart model, mapping exactly to your lowercase Postgres columns
export const Cart = sequelize.define('cart', {
  cartID: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: 'cartid'
  },
  buyerID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'buyerid'
  },
  productID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'productid'
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    field: 'quantity'
  }
}, {
  tableName:  'cart',
  timestamps: true,
  createdAt:  'added_at',
  updatedAt:  false
});

// Associate Cart → Product
Cart.belongsTo(Product, { foreignKey: 'productID', as: 'product' });

// GET /api/cart?buyerID=...
export async function getCart(req, res) {
  const buyerID = parseInt(req.query.buyerID, 10);
  if (!buyerID) return res.status(400).json({ error: 'buyerID query required' });

  try {
    const items = await Cart.findAll({
      where: { buyerID },
      include: [{
        association: 'product',
        attributes: ['productname', 'productprice', 'productpicture']
      }]
    });
    res.json(items);
  } catch (err) {
    console.error('Error fetching cart:', err);
    res.status(500).json({ error: err.message });
  }
}

// POST /api/cart
export async function addCartItem(req, res) {
  const { buyerID, productID, quantity = 1 } = req.body;
  if (!buyerID || !productID) {
    return res.status(400).json({ error: 'buyerID and productID required' });
  }
  try {
    const item = await Cart.create({ buyerID, productID, quantity });
    eventBus.emit('cartItemAdded', { item, timestamp: new Date().toISOString() });
    res.status(201).json(item);
  } catch (err) {
    console.error('Error adding to cart:', err);
    res.status(500).json({ error: err.message });
  }
}