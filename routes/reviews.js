// routes/reviews.js
import express from 'express';
import { submitReviewHandler } from '../controllers/reviewController.js';
const router = express.Router();

router.post('/', submitReviewHandler);

export default router;