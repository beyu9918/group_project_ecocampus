import express from 'express';
import { register, login } from '../controllers/userController.js'; 
import { updateProfile } from '../controllers/userController.js';

const router = express.Router();

router.post('/profile/update', updateProfile);
router.post('/register', register);
router.post('/login', login);

export default router;