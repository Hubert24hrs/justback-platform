const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');

// GET /admin/stats
router.get('/stats', authenticate, authorize('admin'), async (req, res) => {
    res.json({
        success: true,
        data: {
            totalUsers: 150,
            totalProperties: 45,
            totalBookings: 320,
            totalRevenue: 15000000
        }
    });
});

// GET /admin/users
router.get('/users', authenticate, authorize('admin'), async (req, res) => {
    res.json({
        success: true,
        data: { users: [] }
    });
});

// GET /admin/properties
router.get('/properties', authenticate, authorize('admin'), async (req, res) => {
    res.json({
        success: true,
        data: { properties: [] }
    });
});

module.exports = router;
