import express from 'express';

import {
  addOrderItems,
  createStripeCheckoutSession,
  getMyOrders,
  getOrderById,
  getOrders,
  updateOrderToDelivered,
  updateOrderToPaid,
  verifyPaymentAndUpdateOrder,
} from '../controllers/orderController.js';

import { admin, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, addOrderItems).get(protect, admin, getOrders);
router.route('/myorders').get(protect, getMyOrders);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/create-checkout-session').post(protect, createStripeCheckoutSession);
router.route('/:id/verify-payment').put(protect, verifyPaymentAndUpdateOrder);
router.route('/:id/pay').put(protect, updateOrderToPaid);
router.route('/:id/deliver').put(protect, admin, updateOrderToDelivered);

export default router;
