const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

// GET /wallet/balance
router.get('/balance', authenticate, async (req, res) => {
    // Mock response
    res.json({
        success: true,
        data: {
            balance: 50000.00,
            currency: 'NGN'
        }
    });
});

// GET /wallet/transactions
router.get('/transactions', authenticate, async (req, res) => {
    res.json({
        success: true,
        data: {
            transactions: [
                { id: 'txn-1', type: 'credit', amount: 50000, description: 'Booking payout', date: new Date().toISOString() },
                { id: 'txn-2', type: 'debit', amount: 10000, description: 'Withdrawal', date: new Date().toISOString() }
            ]
        }
    });
});

// POST /wallet/withdraw
router.post('/withdraw', authenticate, async (req, res) => {
    res.json({
        success: true,
        message: 'Withdrawal request submitted',
        data: { requestId: 'wd-' + Date.now() }
    });
});

module.exports = router;
