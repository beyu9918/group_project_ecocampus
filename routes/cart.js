import express from 'express';
import { getCart, addCartItem } from '../controllers/cartController.js';
const router = express.Router();
router.get('/', getCart);
router.post('/', addCartItem);
export default router;
