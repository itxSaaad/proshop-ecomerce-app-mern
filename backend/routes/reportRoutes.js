import { Router } from 'express';

const router = Router();

import {
  getSalesAnalytics,
  getProductAnalytics,
  getCustomerAnalytics,
  getOrderAnalytics,
  getFinancialSummary,
} from '../controllers/reportController.js';

import { admin, protect } from '../middleware/authMiddleware.js';

router.get('/sales-analytics', protect, admin, getSalesAnalytics);
router.get('/product-analytics', protect, admin, getProductAnalytics);
router.get('/customer-analytics', protect, admin, getCustomerAnalytics);
router.get('/order-analytics', protect, admin, getOrderAnalytics);
router.get('/financial-summary', protect, admin, getFinancialSummary);

export default router;
