const bookingService = require('../services/booking.service');
const paymentService = require('../services/payment.service');
const Joi = require('joi');

class BookingController {
    // Create booking
    async createBooking(req, res, next) {
        try {
            const schema = Joi.object({
                propertyId: Joi.string().required(),
                checkInDate: Joi.date().iso().required(),
                checkOutDate: Joi.date().iso().greater(Joi.ref('checkInDate')).required(),
                numGuests: Joi.number().integer().min(1).required(),
                guestNotes: Joi.string(),
                paymentMethod: Joi.string().valid('PAYSTACK', 'FLUTTERWAVE', 'WALLET').default('PAYSTACK')
            });

            const { error, value } = schema.validate(req.body);

            if (error) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: error.details[0].message
                    }
                });
            }

            // Create booking
            const booking = await bookingService.createBooking(req.user.id, value);

            // Initialize payment
            const payment = await paymentService.initializePayment(
                req.user.id,
                booking.bookingId,
                booking.pricing.total,
                req.user.email
            );

            res.status(201).json({
                success: true,
                data: {
                    booking,
                    payment
                },
                message: 'Booking created. Please complete payment.'
            });
        } catch (error) {
            next(error);
        }
    }

    // Get booking details
    async getBookingById(req, res, next) {
        try {
            const booking = await bookingService.getBookingById(req.params.id, req.user.id);

            res.json({
                success: true,
                data: booking
            });
        } catch (error) {
            next(error);
        }
    }

    // Get user's bookings
    async getMyBookings(req, res, next) {
        try {
            const role = req.query.role || req.user.role;
            const bookings = await bookingService.getUserBookings(req.user.id, role);

            res.json({
                success: true,
                data: bookings
            });
        } catch (error) {
            next(error);
        }
    }

    // Cancel booking
    async cancelBooking(req, res, next) {
        try {
            const schema = Joi.object({
                reason: Joi.string().required()
            });

            const { error, value } = schema.validate(req.body);

            if (error) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: error.details[0].message
                    }
                });
            }

            const result = await bookingService.cancelBooking(req.params.id, req.user.id, value.reason);

            res.json({
                success: true,
                data: result,
                message: 'Booking cancelled successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    // Check-in (host only)
    async checkIn(req, res, next) {
        try {
            const booking = await bookingService.checkIn(req.params.id, req.user.id);

            res.json({
                success: true,
                data: booking,
                message: 'Guest checked in successfully. Funds released to your wallet.'
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new BookingController();
