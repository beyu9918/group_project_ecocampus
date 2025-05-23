import express from 'express';
import { getProductDetails, submitReview } from '../controllers/reviewController.js';

const router = express.Router();

router.get('/:id/review', getProductDetails);
router.post('/:id/review', submitReview);

export default router;