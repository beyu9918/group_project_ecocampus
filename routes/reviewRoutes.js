import express from 'express';
import { getProductDetails, submitReview } from '../controllers/reviewController.js';

const router = express.Router();

// GET: show product detail and comment box
router.get('/:id/review', getProductDetails);

// POST: submit review (must be logged in)
router.post('/:id/review', ensureLoggedIn, submitReview);

// ✅ 中间件：如果未登录，则跳转登录页面
function ensureLoggedIn(req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  next();
}

export default router;