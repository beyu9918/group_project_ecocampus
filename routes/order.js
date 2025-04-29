import express from 'express';
import { placeOrderHandler } from '../controllers/orderController.js';
const router = express.Router();
router.post('/', placeOrderHandler);
export default router;