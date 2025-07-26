import express from 'express';
import { getAdminDashboard, getStoreOwnerDashboard } from '../controllers/dashboardController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/admin', authenticate, authorize('admin'), getAdminDashboard);
router.get('/store-owner', authenticate, authorize('store_owner'), getStoreOwnerDashboard);

export default router;