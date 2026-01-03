const { connectDatabase, query } = require('../src/config/database');
const bookingService = require('../src/services/booking.service');
const crypto = require('crypto');
require('dotenv').config();

async function run() {
    try {
        await connectDatabase();

        // Get an existing booking and payment
        const bookingRes = await query('SELECT id FROM bookings WHERE status = $1 LIMIT 1', ['PENDING']);
        if (bookingRes.rows.length === 0) {
            console.log('No pending bookings found. Creating test data...');
            // Would need to create test data here
            return;
        }
        const bookingId = bookingRes.rows[0].id;
        console.log('Found booking:', bookingId);

        // Create a payment for this booking
        const paymentId = crypto.randomUUID();
        const booking = await query('SELECT guest_id FROM bookings WHERE id = $1', [bookingId]);
        const guestId = booking.rows[0].guest_id;

        await query(
            "INSERT INTO payments (id, booking_id, user_id, amount, status, payment_type, gateway, reference) VALUES ($1, $2, $3, 1000, 'SUCCESS', 'BOOKING', 'WALLET', $4)",
            [paymentId, bookingId, guestId, 'REF-TEST-' + Date.now()]
        );
        console.log('Payment created:', paymentId);

        // Now call confirmBooking
        console.log('Calling confirmBooking...');
        const result = await bookingService.confirmBooking(bookingId, paymentId);
        console.log('confirmBooking SUCCESS:', result);

    } catch (err) {
        console.error('Error:', err.message);
        console.error('Full:', JSON.stringify(err, Object.getOwnPropertyNames(err)));
    }
}

run();
