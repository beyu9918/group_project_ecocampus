import express from 'express';
import {
  showProductPage,
  showAddProductPage,
  addNewProduct 
} from '../controllers/product.js';

const router = express.Router();

router.get('/product', showProductPage);
router.get('/product/addProduct', showAddProductPage);

router.post('/product/addProduct', addNewProduct);

export default router;


  
  




