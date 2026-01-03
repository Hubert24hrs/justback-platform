const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const adminController = require('../controllers/admin.controller');
const kycController = require('../controllers/kyc.controller');

// Dashboard Stats
router.get('/stats', authenticate, authorize('admin'), adminController.getStats);

// Composite Dashboard
router.get('/dashboard', authenticate, authorize('admin'), adminController.getDashboardData);

// Revenue Chart
router.get('/analytics/revenue', authenticate, authorize('admin'), adminController.getRevenueAnalytics);

// Recent Activity
router.get('/activity', authenticate, authorize('admin'), adminController.getRecentActivity);

// User Management
router.get('/users', authenticate, authorize('admin'), adminController.getUsers);
router.get('/users/:userId', authenticate, authorize('admin'), adminController.getUserById);
router.patch('/users/:userId', authenticate, authorize('admin'), adminController.updateUser);

// Property Management (placeholder - uses property service)
router.get('/properties', authenticate, authorize('admin'), async (req, res) => {
    const propertyService = require('../services/property.service');
    try {
        const result = await propertyService.searchProperties({}, { page: 1, limit: 50 });
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: { message: error.message } });
    }
});

// Booking Management
router.patch('/bookings/:bookingId/status', authenticate, authorize('admin'), adminController.updateBookingStatus);

// KYC Management
router.get('/kyc/pending', authenticate, authorize('admin'), kycController.getPendingKYC);
router.post('/kyc/:submissionId/approve', authenticate, authorize('admin'), kycController.approveKYC);
router.post('/kyc/:submissionId/reject', authenticate, authorize('admin'), kycController.rejectKYC);

module.exports = router;
