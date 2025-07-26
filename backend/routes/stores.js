import express from 'express';
import { getStores, createStore, getStoreById } from '../controllers/storeController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, getStores);
router.post('/', authenticate, authorize('admin'), createStore);
router.get('/:id', authenticate, getStoreById);

export default router;