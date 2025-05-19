import express from 'express';
import {
  showProductPage,
  showAddProductPage,
  addNewProduct,
  showProductDetail 
} from '../controllers/product.js';

const router = express.Router();


router.get('/product', showProductPage);
router.get('/product/addProduct', showAddProductPage);
router.post('/product/addProduct', addNewProduct);
router.get('/product/:productid', showProductDetail);

export default router;
