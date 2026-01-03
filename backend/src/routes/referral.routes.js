const express = require('express');
const router = express.Router();
const referralController = require('../controllers/referral.controller');
const { authenticate } = require('../middleware/auth');

// Public: Validate referral code
router.get('/validate/:code', referralController.validateCode);

// Protected: Get stats and history
router.get('/stats', authenticate, referralController.getStats);
router.get('/history', authenticate, referralController.getHistory);

module.exports = router;
