const reviewService = require('../services/review.service');
const Joi = require('joi');

class ReviewController {
    // Create review
    async createReview(req, res, next) {
        try {
            const schema = Joi.object({
                bookingId: Joi.string().required(),
                propertyId: Joi.string().optional(),
                rating: Joi.number().min(1).max(5).required(),
                title: Joi.string().max(100).optional(),
                content: Joi.string().min(10).max(1000).required(),
                cleanliness: Joi.number().min(1).max(5).optional(),
                communication: Joi.number().min(1).max(5).optional(),
                location: Joi.number().min(1).max(5).optional(),
                value: Joi.number().min(1).max(5).optional()
            });

            const { error, value } = schema.validate(req.body);
            if (error) {
                return res.status(400).json({
                    success: false,
                    error: { code: 'VALIDATION_ERROR', message: error.details[0].message }
                });
            }

            const result = await reviewService.createReview(req.user.id, value);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    // Get property reviews
    async getPropertyReviews(req, res, next) {
        try {
            const { propertyId } = req.params;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            const result = await reviewService.getPropertyReviews(propertyId, { page, limit });
            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    // Host response
    async addHostResponse(req, res, next) {
        try {
            const { reviewId } = req.params;
            const { response } = req.body;

            if (!response || response.length < 10) {
                return res.status(400).json({
                    success: false,
                    error: { message: 'Response must be at least 10 characters' }
                });
            }

            const result = await reviewService.addHostResponse(reviewId, req.user.id, response);
            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ReviewController();
