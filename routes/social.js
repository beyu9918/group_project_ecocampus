import express from 'express';import { followSeller,shareListing } from '../controllers/socialController.js';
const router=express.Router();
router.post('/follow',followSeller);
router.post('/share',shareListing);
export default router;