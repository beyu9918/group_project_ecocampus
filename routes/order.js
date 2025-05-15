import express from 'express';
import { placeOrderHandler } from '../controllers/orderController.js';
import { payOrderHandler } from '../controllers/orderController.js';

const router = express.Router();
router.post('/', placeOrderHandler);
router.post('/:orderID/pay', payOrderHandler);
export default router;