const { connectDatabase, query } = require('../src/config/database');
const crypto = require('crypto');
require('dotenv').config();

async function run() {
    try {
        await connectDatabase();

        const userId = 'u_esc_' + Date.now();
        const hostId = 'h_esc_' + Date.now();
        const propId = 'p_esc_' + Date.now();
        const bookingId = 'b_esc_' + Date.now();
        const paymentId = crypto.randomUUID();

        // Create FK dependencies
        await query("INSERT INTO users (id, email, password_hash, first_name, last_name, role) VALUES ($1, $2, 'hash', 'U', 'E', 'guest')", [userId, 'u' + Date.now() + '@e.com']);
        await query("INSERT INTO users (id, email, password_hash, first_name, last_name, role) VALUES ($1, $2, 'hash', 'H', 'E', 'host')", [hostId, 'h' + Date.now() + '@e.com']);
        await query("INSERT INTO properties (id, host_id, title, description, property_type, address, city, state, price_per_night, bedrooms, bathrooms, max_guests, status) VALUES ($1, $2, 'P', 'D', 'apartment', 'A', 'C', 'S', 1, 1, 1, 1, 'ACTIVE')", [propId, hostId]);
        await query("INSERT INTO bookings (id, booking_reference, guest_id, host_id, property_id, check_in_date, check_out_date, nights, num_guests, subtotal, service_fee, total_amount, status) VALUES ($1, $2, $3, $4, $5, '2025-01-01', '2025-01-05', 4, 1, 1000, 100, 1100, 'PENDING')", [bookingId, 'REF' + Date.now(), userId, hostId, propId]);
        await query("INSERT INTO payments (id, booking_id, user_id, amount, status, payment_type, gateway, reference) VALUES ($1, $2, $3, 1100, 'SUCCESS', 'BOOKING', 'WALLET', $4)", [paymentId, bookingId, userId, 'REF-P' + Date.now()]);

        console.log('FK dependencies created. Testing escrow insert...');
        await query(
            `INSERT INTO escrow (
                booking_id, payment_id, total_amount, guest_fee, host_commission, host_payout,
                scheduled_release_date, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [bookingId, paymentId, 1100, 100, 137.5, 862.5, '2025-01-01', 'HELD']
        );
        console.log('Escrow insert SUCCESS!');

    } catch (err) {
        console.error('Error:', err.message || err);
    }
}

run();
