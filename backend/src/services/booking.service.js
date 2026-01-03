const { query } = require('../config/database');
const propertyService = require('./property.service');
const { randomUUID } = require('crypto');

class BookingService {
    // Generate unique booking reference
    generateBookingReference() {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `JB-2026-${timestamp}${random}`;
    }

    // Calculate nights between dates
    calculateNights(checkInDate, checkOutDate) {
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        return Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    }

    // Create booking
    async createBooking(guestId, bookingData) {
        const { propertyId, checkInDate, checkOutDate, numGuests, guestNotes, paymentMethod } = bookingData;

        // Get property details
        const property = await propertyService.getPropertyById(propertyId);

        // Check availability
        const availability = await propertyService.checkAvailability(propertyId, checkInDate, checkOutDate);

        if (!availability.available) {
            const error = new Error('Property not available for selected dates');
            error.statusCode = 409;
            error.code = 'NOT_AVAILABLE';
            error.details = { blockedDates: availability.blockedDates };
            throw error;
        }

        // Validate guest count
        if (numGuests > property.maxGuests) {
            const error = new Error(`Property can accommodate maximum ${property.maxGuests} guests`);
            error.statusCode = 400;
            error.code = 'EXCEEDS_MAX_GUESTS';
            throw error;
        }

        const nights = availability.nights;
        const subtotal = availability.pricing.subtotal;
        const cleaningFee = availability.pricing.cleaningFee;
        const serviceFee = availability.pricing.serviceFee;
        const totalAmount = availability.pricing.total;

        const bookingReference = this.generateBookingReference();
        const bookingId = randomUUID();
        const createdAt = new Date().toISOString();

        // Create booking
        await query(
            `INSERT INTO bookings (
        id, booking_reference, guest_id, host_id, property_id,
        check_in_date, check_out_date, nights, num_guests,
        subtotal, cleaning_fee, service_fee, total_amount,
        guest_notes, status, payment_status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
            [
                bookingId, bookingReference, guestId, property.host.id, propertyId,
                checkInDate, checkOutDate, nights, numGuests,
                subtotal, cleaningFee, serviceFee, totalAmount,
                guestNotes || null, 'PENDING', 'PENDING', createdAt
            ]
        );

        // Block dates in availability calendar
        await this.blockDates(propertyId, checkInDate, checkOutDate, bookingId);

        // Return booking with payment initialization data
        return {
            bookingId,
            id: bookingId,
            bookingReference,
            property: {
                id: property.id,
                title: property.title,
                address: property.address,
                images: property.images
            },
            checkInDate,
            checkOutDate,
            nights,
            numGuests,
            pricing: {
                subtotal,
                cleaningFee,
                serviceFee,
                total: totalAmount
            },
            status: 'PENDING',
            paymentStatus: 'PENDING',
            createdAt
        };
    }

    // Block dates in availability calendar
    async blockDates(propertyId, checkInDate, checkOutDate, bookingId = null) {
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);

        const dates = [];
        for (let d = new Date(checkIn); d < checkOut; d.setDate(d.getDate() + 1)) {
            dates.push(new Date(d).toISOString().split('T')[0]);
        }

        for (const date of dates) {
            await query(
                `INSERT INTO availability (property_id, date, status)
         VALUES ($1, $2, $3)
         ON CONFLICT (property_id, date)
         DO UPDATE SET status = 'BOOKED'`,
                [propertyId, date, 'BOOKED']
            );
        }
    }

    // Get booking by ID
    async getBookingById(bookingId, userId = null) {
        const result = await query(
            `SELECT b.*, 
              p.title as property_title, p.address as property_address, 
              p.images as property_images, p.city as property_city,
              h.id as host_id, h.first_name as host_first_name, h.phone as host_phone,
              g.id as guest_id, g.first_name as guest_first_name, g.phone as guest_phone
       FROM bookings b
       JOIN properties p ON b.property_id = p.id
       JOIN users h ON b.host_id = h.id
       JOIN users g ON b.guest_id = g.id
       WHERE b.id = $1`,
            [bookingId]
        );

        if (result.rows.length === 0) {
            const error = new Error('Booking not found');
            error.statusCode = 404;
            error.code = 'BOOKING_NOT_FOUND';
            throw error;
        }

        const booking = result.rows[0];

        // Check authorization
        if (userId && booking.guest_id !== userId && booking.host_id !== userId) {
            const error = new Error('Not authorized to view this booking');
            error.statusCode = 403;
            error.code = 'FORBIDDEN';
            throw error;
        }

        return {
            id: booking.id,
            bookingReference: booking.booking_reference,
            property: {
                id: booking.property_id,
                title: booking.property_title,
                address: booking.property_address,
                city: booking.property_city,
                images: booking.property_images || []
            },
            host: {
                id: booking.host_id,
                firstName: booking.host_first_name,
                phone: booking.host_phone
            },
            guest: {
                id: booking.guest_id,
                firstName: booking.guest_first_name,
                phone: booking.guest_phone
            },
            checkInDate: booking.check_in_date,
            checkOutDate: booking.check_out_date,
            nights: booking.nights,
            numGuests: booking.num_guests,
            pricing: {
                subtotal: parseFloat(booking.subtotal),
                cleaningFee: parseFloat(booking.cleaning_fee),
                serviceFee: parseFloat(booking.service_fee),
                total: parseFloat(booking.total_amount)
            },
            status: booking.status,
            paymentStatus: booking.payment_status,
            guestNotes: booking.guest_notes,
            checkedInAt: booking.checked_in_at,
            checkedOutAt: booking.checked_out_at,
            cancelledAt: booking.cancelled_at,
            cancellationReason: booking.cancellation_reason,
            createdAt: booking.created_at
        };
    }

    // Get user's bookings
    async getUserBookings(userId, role) {
        const field = role === 'host' ? 'host_id' : 'guest_id';

        const result = await query(
            `SELECT b.id, b.booking_reference, b.check_in_date, b.check_out_date,
              b.nights, b.total_amount, b.status, b.payment_status, b.created_at,
              p.title as property_title, p.images as property_images, p.city
       FROM bookings b
       JOIN properties p ON b.property_id = p.id
       WHERE b.${field} = $1
       ORDER BY b.created_at DESC`,
            [userId]
        );

        return result.rows.map(booking => ({
            id: booking.id,
            bookingReference: booking.booking_reference,
            property: {
                title: booking.property_title,
                city: booking.city,
                images: booking.property_images || []
            },
            checkInDate: booking.check_in_date,
            checkOutDate: booking.check_out_date,
            nights: booking.nights,
            total: parseFloat(booking.total_amount),
            status: booking.status,
            paymentStatus: booking.payment_status,
            createdAt: booking.created_at
        }));
    }

    // Confirm booking (after payment)
    async confirmBooking(bookingId, paymentId) {
        await query(
            `UPDATE bookings
       SET status = 'CONFIRMED', payment_status = 'PAID'
       WHERE id = $1`,
            [bookingId]
        );

        // Create escrow record (skip for SQLite mode due to FK complexity)
        if (process.env.DB_TYPE !== 'sqlite') {
            const booking = await this.getBookingById(bookingId);
            const totalAmount = booking.pricing.total || 0;
            const subtotal = booking.pricing.subtotal || 0;
            const serviceFee = booking.pricing.serviceFee || 0;
            const hostCommission = totalAmount * 0.125; // 12.5% commission
            const hostPayout = subtotal - hostCommission;

            await query(
                `INSERT OR IGNORE INTO escrow (
            booking_id, payment_id, total_amount, guest_fee, host_commission, host_payout,
            scheduled_release_date, status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [
                    bookingId, paymentId, totalAmount, serviceFee,
                    hostCommission, hostPayout, booking.checkInDate, 'HELD'
                ]
            );
        }

        return this.getBookingById(bookingId);
    }

    // Cancel booking
    async cancelBooking(bookingId, userId, reason) {
        const booking = await this.getBookingById(bookingId, userId);

        if (booking.status === 'CANCELLED') {
            const error = new Error('Booking already cancelled');
            error.statusCode = 400;
            error.code = 'ALREADY_CANCELLED';
            throw error;
        }

        if (booking.status === 'CHECKED_IN' || booking.status === 'CHECKED_OUT') {
            const error = new Error('Cannot cancel completed booking');
            error.statusCode = 400;
            error.code = 'CANNOT_CANCEL';
            throw error;
        }

        // Check cancellation policy
        const now = new Date();
        const checkIn = new Date(booking.checkInDate);
        const hoursUntilCheckIn = (checkIn - now) / (1000 * 60 * 60);

        let refundAmount = 0;
        if (hoursUntilCheckIn >= 24) {
            // Full refund if more than 24 hours
            refundAmount = booking.pricing.total;
        }

        // Cancel booking
        await query(
            `UPDATE bookings
       SET status = 'CANCELLED', cancellation_reason = $1, cancelled_at = NOW()
       WHERE id = $2`,
            [reason, bookingId]
        );

        // Free up dates
        await this.freeDates(booking.property.id, booking.checkInDate, booking.checkOutDate);

        return {
            booking: await this.getBookingById(bookingId),
            refund: {
                amount: refundAmount,
                processingTime: '3-5 business days'
            }
        };
    }

    // Free dates in availability calendar
    async freeDates(propertyId, checkInDate, checkOutDate) {
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);

        const dates = [];
        for (let d = new Date(checkIn); d < checkOut; d.setDate(d.getDate() + 1)) {
            dates.push(new Date(d).toISOString().split('T')[0]);
        }

        for (const date of dates) {
            await query(
                `UPDATE availability SET status = 'AVAILABLE'
         WHERE property_id = $1 AND date = $2`,
                [propertyId, date]
            );
        }
    }

    // Check-in
    async checkIn(bookingId, hostId) {
        const booking = await this.getBookingById(bookingId);

        if (booking.host.id !== hostId) {
            const error = new Error('Not authorized');
            error.statusCode = 403;
            throw error;
        }

        if (booking.status !== 'CONFIRMED') {
            const error = new Error('Booking must be confirmed first');
            error.statusCode = 400;
            throw error;
        }

        await query(
            `UPDATE bookings
       SET status = 'CHECKED_IN', checked_in_at = NOW()
       WHERE id = $1`,
            [bookingId]
        );

        // Release escrow to host
        await this.releaseEscrow(bookingId);

        return this.getBookingById(bookingId);
    }

    // Release escrow funds to host
    async releaseEscrow(bookingId) {
        const result = await query(
            `UPDATE escrow
       SET status = 'RELEASED', released_at = NOW()
       WHERE booking_id = $1 AND status = 'HELD'
       RETURNING host_payout`,
            [bookingId]
        );

        if (result.rows.length > 0) {
            const booking = await this.getBookingById(bookingId);

            // Credit host wallet
            await query(
                `UPDATE users
         SET wallet_balance = wallet_balance + $1
         WHERE id = $2`,
                [result.rows[0].host_payout, booking.host.id]
            );

            // Log transaction
            await query(
                `INSERT INTO wallet_transactions (user_id, type, amount, balance_after, description, booking_id)
         SELECT $1, 'CREDIT', $2, wallet_balance, $3, $4
         FROM users WHERE id = $1`,
                [booking.host.id, result.rows[0].host_payout, 'Booking payout', bookingId]
            );
        }
    }
}

module.exports = new BookingService();
