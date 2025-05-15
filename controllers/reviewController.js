import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import eventBus from './eventBus.js';

// Define Review model mapping to `reviews` table
export const Review = sequelize.define('reviews', {
  reviewID:   { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  productID:  { type: DataTypes.INTEGER, allowNull: false },
  reviewerID: { type: DataTypes.INTEGER, allowNull: false },
  rating:     { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
  comment:    { type: DataTypes.TEXT }
}, {
  tableName:    'reviews',
  timestamps:   true,
  createdAt:    'createdAt',
  updatedAt:    false,
  underscored:  true
});

// POST /api/reviews
export async function submitReviewHandler(req, res) {
  const { productID, reviewerID, rating, comment } = req.body;
  if (!productID || !reviewerID || !rating) {
    return res.status(400).json({ error: 'productID, reviewerID, and rating are required' });
  }
  try {
    const review = await Review.create({ productID, reviewerID, rating, comment });
    // emit a notification event
    eventBus.emit('notification', {
      type: 'review',
      message: `Review submitted for product ${productID}`,
      timestamp: new Date().toISOString()
    });
    res.status(201).json(review);
  } catch (err) {
    console.error('Error creating review:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
