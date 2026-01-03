const { query } = require('../config/database');
const crypto = require('crypto');

class ReviewService {
    // Create a review
    async createReview(userId, reviewData) {
        const { bookingId, propertyId, rating, title, content, cleanliness, communication, location, value } = reviewData;

        // Verify the booking exists and belongs to this user
        const bookingCheck = await query(
            "SELECT id, status, property_id FROM bookings WHERE id = $1 AND guest_id = $2",
            [bookingId, userId]
        );

        if (bookingCheck.rows.length === 0) {
            const error = new Error('Booking not found or not authorized');
            error.statusCode = 404;
            throw error;
        }

        if (bookingCheck.rows[0].status !== 'COMPLETED' && bookingCheck.rows[0].status !== 'CONFIRMED') {
            const error = new Error('Can only review completed bookings');
            error.statusCode = 400;
            throw error;
        }

        // Check if review already exists
        const existingReview = await query(
            "SELECT id FROM reviews WHERE booking_id = $1",
            [bookingId]
        );

        if (existingReview.rows.length > 0) {
            const error = new Error('Review already submitted for this booking');
            error.statusCode = 400;
            throw error;
        }

        const reviewId = crypto.randomUUID();
        const actualPropertyId = propertyId || bookingCheck.rows[0].property_id;

        await query(
            `INSERT INTO reviews (id, booking_id, property_id, user_id, rating, title, content, 
             cleanliness_rating, communication_rating, location_rating, value_rating)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
            [reviewId, bookingId, actualPropertyId, userId, rating, title || null, content,
                cleanliness || rating, communication || rating, location || rating, value || rating]
        );

        // Update property average rating
        await this._updatePropertyRating(actualPropertyId);

        return { id: reviewId, message: 'Review submitted successfully' };
    }

    // Get reviews for a property
    async getPropertyReviews(propertyId, pagination = {}) {
        const { page = 1, limit = 10 } = pagination;
        const offset = (page - 1) * limit;

        const countResult = await query(
            "SELECT COUNT(*) as count FROM reviews WHERE property_id = $1",
            [propertyId]
        );
        const total = parseInt(countResult.rows[0].count);

        const result = await query(
            `SELECT r.*, u.first_name, u.last_name, u.avatar_url
             FROM reviews r
             JOIN users u ON r.user_id = u.id
             WHERE r.property_id = $1
             ORDER BY r.created_at DESC
             LIMIT $2 OFFSET $3`,
            [propertyId, limit, offset]
        );

        const reviews = result.rows.map(r => ({
            id: r.id,
            rating: r.rating,
            title: r.title,
            content: r.content,
            ratings: {
                cleanliness: r.cleanliness_rating,
                communication: r.communication_rating,
                location: r.location_rating,
                value: r.value_rating
            },
            user: {
                firstName: r.first_name,
                lastName: r.last_name?.[0] + '.',
                avatarUrl: r.avatar_url
            },
            createdAt: r.created_at
        }));

        // Get aggregate stats
        const statsResult = await query(
            `SELECT 
                AVG(rating) as avg_rating,
                AVG(cleanliness_rating) as avg_cleanliness,
                AVG(communication_rating) as avg_communication,
                AVG(location_rating) as avg_location,
                AVG(value_rating) as avg_value
             FROM reviews WHERE property_id = $1`,
            [propertyId]
        );

        const stats = statsResult.rows[0];

        return {
            reviews,
            stats: {
                averageRating: parseFloat(stats.avg_rating) || 0,
                cleanliness: parseFloat(stats.avg_cleanliness) || 0,
                communication: parseFloat(stats.avg_communication) || 0,
                location: parseFloat(stats.avg_location) || 0,
                value: parseFloat(stats.avg_value) || 0,
                totalReviews: total
            },
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }

    // Update property average rating
    async _updatePropertyRating(propertyId) {
        const result = await query(
            "SELECT AVG(rating) as avg, COUNT(*) as count FROM reviews WHERE property_id = $1",
            [propertyId]
        );

        const avg = parseFloat(result.rows[0].avg) || 0;
        const count = parseInt(result.rows[0].count) || 0;

        await query(
            "UPDATE properties SET average_rating = $1, review_count = $2 WHERE id = $3",
            [avg.toFixed(2), count, propertyId]
        );
    }

    // Host response to review
    async addHostResponse(reviewId, hostId, response) {
        // Verify host owns the property
        const reviewCheck = await query(
            `SELECT r.id, p.host_id FROM reviews r
             JOIN properties p ON r.property_id = p.id
             WHERE r.id = $1`,
            [reviewId]
        );

        if (reviewCheck.rows.length === 0) {
            const error = new Error('Review not found');
            error.statusCode = 404;
            throw error;
        }

        if (reviewCheck.rows[0].host_id !== hostId) {
            const error = new Error('Not authorized to respond to this review');
            error.statusCode = 403;
            throw error;
        }

        await query(
            "UPDATE reviews SET host_response = $1, host_response_at = $2 WHERE id = $3",
            [response, new Date().toISOString(), reviewId]
        );

        return { success: true, message: 'Response added' };
    }
}

module.exports = new ReviewService();
