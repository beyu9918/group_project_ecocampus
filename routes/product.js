import express from 'express';
import {
  showProductPage,
  showAddProductPage,
  addNewProduct // ✅ 新增这行
} from '../controllers/product.js';

const router = express.Router();

router.get('/product', showProductPage);
router.get('/product/addProduct', showAddProductPage);

// ✅ 表单提交：添加商品
router.post('/product/addProduct', addNewProduct);

export default router;


  
  




