import express from 'express';
import { submitRating, getStoreRatings } from '../controllers/ratingController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, authorize('user'), submitRating);
router.get('/store/:storeId', authenticate, getStoreRatings);

export default router;