const paymentService = require('../services/payment.service');
const bookingService = require('../services/booking.service');
const Joi = require('joi');

class PaymentController {
    // Initialize payment
    async initializePayment(req, res, next) {
        try {
            const schema = Joi.object({
                bookingId: Joi.string().uuid().required(),
                amount: Joi.number().min(0).required(),
                email: Joi.string().email().required()
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

            const payment = await paymentService.initializePayment(
                req.user.id,
                value.bookingId,
                value.amount,
                value.email
            );

            res.json({
                success: true,
                data: payment
            });
        } catch (error) {
            next(error);
        }
    }

    // Verify payment
    async verifyPayment(req, res, next) {
        try {
            const schema = Joi.object({
                reference: Joi.string().required()
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

            const payment = await paymentService.verifyPayment(value.reference);

            // Confirm booking
            if (payment.status === 'SUCCESS' && !payment.alreadyVerified) {
                await bookingService.confirmBooking(payment.bookingId, payment.paymentId);
            }

            const booking = await bookingService.getBookingById(payment.bookingId);

            res.json({
                success: true,
                data: {
                    payment,
                    booking
                },
                message: 'Payment successful! Your booking is confirmed.'
            });
        } catch (error) {
            next(error);
        }
    }

    // Get payment details
    async getPaymentDetails(req, res, next) {
        try {
            const payment = await paymentService.getPaymentDetails(req.params.id);

            res.json({
                success: true,
                data: payment
            });
        } catch (error) {
            next(error);
        }
    }

    // Paystack webhook
    async paystackWebhook(req, res, next) {
        try {
            await paymentService.handlePaystackWebhook(req.body);

            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    }

    // Process refund (admin)
    async processRefund(req, res, next) {
        try {
            const schema = Joi.object({
                bookingId: Joi.string().uuid().required(),
                amount: Joi.number().min(0).required(),
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

            const refund = await paymentService.processRefund(
                value.bookingId,
                value.amount,
                value.reason
            );

            res.json({
                success: true,
                data: refund,
                message: 'Refund initiated successfully'
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new PaymentController();
