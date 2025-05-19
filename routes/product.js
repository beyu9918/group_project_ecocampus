// routes/product.js
import express from 'express';
import {
  showProductPage,
  showAddProductPage,
  addNewProduct,
  showProductDetail
} from '../controllers/product.js';

const router = express.Router();

router.get('/',       showProductPage);
router.get('/add',    showAddProductPage);
router.post('/add',   addNewProduct);
router.get('/:productid', showProductDetail);

export default router;
