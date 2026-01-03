const express = require('express');
const router = express.Router();
const kycController = require('../controllers/kyc.controller');
const { authenticate } = require('../middleware/auth');

// User routes
router.post('/submit', authenticate, kycController.submitKYC);
router.get('/status', authenticate, kycController.getMyKYCStatus);

module.exports = router;
