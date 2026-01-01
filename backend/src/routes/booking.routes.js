const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const { authenticate, authorize } = require('../middleware/auth');

// All booking routes require authentication
router.use(authenticate);

// Guest routes
router.post('/', authorize('guest'), bookingController.createBooking);
router.get('/', bookingController.getMyBookings);
router.get('/:id', bookingController.getBookingById);
router.put('/:id/cancel', bookingController.cancelBooking);

// Host routes
router.post('/:id/check-in', authorize('host'), bookingController.checkIn);

module.exports = router;
