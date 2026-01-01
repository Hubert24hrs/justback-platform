const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authenticate, authorize } = require('../middleware/auth');

// Public webhook (no auth needed)
router.post('/webhook/paystack', paymentController.paystackWebhook);

// Protected routes
router.post('/initialize', authenticate, paymentController.initializePayment);
router.post('/verify', paymentController.verifyPayment);
router.get('/:id', authenticate, paymentController.getPaymentDetails);

// Admin only
router.post('/refund', authenticate, authorize('admin'), paymentController.processRefund);

module.exports = router;
