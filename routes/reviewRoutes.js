import express from 'express';
import { getProductDetails, submitReview } from '../controllers/reviewController.js';

const router = express.Router();

router.use((req, res, next) => {
  req.user = {
    userid: 1, 
    name: 'Test User'
  };
  next();
});

router.get('/:id', getProductDetails);
router.post('/:id/review', submitReview);

export default router;