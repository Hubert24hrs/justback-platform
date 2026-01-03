const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const adminController = require('../controllers/admin.controller');

// Dashboard Stats
router.get('/stats', authenticate, authorize('admin'), adminController.getStats);

// Composite Dashboard
router.get('/dashboard', authenticate, authorize('admin'), adminController.getDashboardData);

// Revenue Chart
router.get('/analytics/revenue', authenticate, authorize('admin'), adminController.getRevenueAnalytics);

// Recent Activity
router.get('/activity', authenticate, authorize('admin'), adminController.getRecentActivity);

// Placeholder for full CRUD (User/Property)
router.get('/users', authenticate, authorize('admin'), async (req, res) => {
    // In real implementation, call adminController.getUsers
    res.json({ success: true, data: { users: [] } });
});

router.get('/properties', authenticate, authorize('admin'), async (req, res) => {
    res.json({ success: true, data: { properties: [] } });
});

// Update Booking Status
router.patch('/bookings/:bookingId/status', authenticate, authorize('admin'), adminController.updateBookingStatus);

module.exports = router;
