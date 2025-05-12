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
//register and login page
router.post('/register', registerForm);
router.post('/login', loginForm);

// Profile display and update
router.get('/profile', renderProfilePage);
router.post('/profile/update', updateProfile);

export default router;