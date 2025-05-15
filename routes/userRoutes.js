import express from 'express';
import {
  register,
  login,
  registerForm,
  loginForm,
  updateProfile,
  renderProfilePage,
  viewAllUsers,
  viewUserOrders,
  viewUserProducts,
  viewUserCart,
  viewUserReviews
} from '../controllers/userController.js';

const router = express.Router();

// Register and login
router.post('/register', registerForm);
router.post('/login', loginForm);

// Profile display and update
router.get('/profile', renderProfilePage);
router.post('/profile/update', updateProfile);

// Admin views
router.get('/admin/users', viewAllUsers);

// [NEW] Admin: View specific user's data
router.get('/admin/user/:id/orders', viewUserOrders);
router.get('/admin/user/:id/products', viewUserProducts);
router.get('/admin/user/:id/cart', viewUserCart);
router.get('/admin/user/:id/reviews', viewUserReviews);

export default router;