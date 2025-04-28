import express from 'express';
import { register, login } from '../controllers/userController.js'; // 注意加 .js 后缀

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

export default router;