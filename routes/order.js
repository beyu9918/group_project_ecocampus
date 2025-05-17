import { Router } from 'express';
import {
  placeOrderHandler,
  payOrderHandler
} from '../controllers/orderController.js';

const router = Router();
router.post('/',       placeOrderHandler);
router.patch('/:orderID/pay', payOrderHandler);

export default router;
