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
  viewUserReviews,
  deleteUser,
  changeUserRole,
} from '../controllers/userController.js';

const router = express.Router();

// Register and login
router.post('/register', registerForm);
router.post('/login', loginForm);

// Profile display and update
router.get('/profile', renderProfilePage);
router.post('/profile/update', updateProfile);

// Admin views (protected)
router.get('/admin/users', viewAllUsers);
router.get('/admin/user/:id/orders', viewUserOrders);
router.get('/admin/user/:id/products', viewUserProducts);
router.get('/admin/user/:id/cart', viewUserCart);
router.get('/admin/user/:id/reviews', viewUserReviews);
router.post('/admin/user/:id/delete', deleteUser);
router.post('/admin/user/:id/role', changeUserRole);

export default router;