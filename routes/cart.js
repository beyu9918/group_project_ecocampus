import { Router } from 'express';
import { getCart, addCartItem } from '../controllers/cartController.js';

const router = Router();
router.get('/',  getCart);
router.post('/', addCartItem);

export default router;
