const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { authenticate, authorize } = require('../middleware/auth');

// Create review (guests only, after booking)
router.post('/', authenticate, reviewController.createReview);

// Get reviews for a property (public)
router.get('/property/:propertyId', reviewController.getPropertyReviews);

// Host response to review
router.post('/:reviewId/response', authenticate, authorize('host', 'admin'), reviewController.addHostResponse);

module.exports = router;
