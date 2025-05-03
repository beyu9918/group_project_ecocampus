import express from 'express';
import {
    register,
    login,
    registerForm,
    loginForm,
    updateProfile,
    renderProfilePage
  } from '../controllers/userController.js';

const router = express.Router();

router.post('/register', registerForm);
router.post('/login', loginForm);

// Profile 展示与更新
router.get('/profile', renderProfilePage);
router.post('/profile/update', updateProfile);

export default router;