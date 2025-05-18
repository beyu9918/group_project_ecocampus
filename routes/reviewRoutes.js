import express from 'express';
import { getProductDetails, submitReview } from '../controllers/reviewController.js';

const router = express.Router();

// 添加模拟用户中间件（开发测试用）
router.use((req, res, next) => {
  req.user = {
    userid: 1, // ⚠️ 确保这个 userID 在你的 users 表中存在
    name: 'Test User'
  };
  next();
});

router.get('/:id', getProductDetails);
router.post('/:id/review', submitReview);

export default router;