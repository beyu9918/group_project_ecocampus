import express from 'express';
import {
    register,
    login,
    registerForm,
    loginForm,
    updateProfile,
    renderProfilePage,
    viewAllUsers 
  } from '../controllers/userController.js';

const router = express.Router();
//register and login page
router.post('/register', registerForm);
router.post('/login', loginForm);

// Profile display and update
router.get('/profile', renderProfilePage);
router.post('/profile/update', updateProfile);

// Page redirect from profile if usergroup is admin
router.get('/admin/users', viewAllUsers);
export default router;