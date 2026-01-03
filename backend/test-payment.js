const { query } = require('./src/config/database');
const paymentService = require('./src/services/payment.service');
const { v4: uuidv4 } = require('uuid');

async function test() {
    try {
        console.log('Starting Payment Service Test...');
        const userId = uuidv4();
        const bookingId = uuidv4();
        const propertyId = uuidv4();

        // 1. Insert User
        console.log('Seeding User...');
        await query(
            `INSERT INTO users (id, email, password_hash, first_name, last_name, role) 
             VALUES ($1, 'test-pay@example.com', 'hash', 'Test', 'User', 'guest')`,
            [userId]
        );

        // 2. Insert Property
        console.log('Seeding Property...');
        await query(
            `INSERT INTO properties (id, host_id, title, description, property_type, address, city, state, bedrooms, bathrooms, max_guests, price_per_night) 
             VALUES ($1, $2, 'Test Prop', 'Desc', 'apartment', 'Addr', 'Lagos', 'Lagos', 1, 1, 2, 1000)`,
            [propertyId, userId]
        );

        // 3. Insert Booking
        console.log('Seeding Booking...');
        await query(
            `INSERT INTO bookings (id, booking_reference, guest_id, property_id, check_in_date, check_out_date, nights, num_guests, subtotal, service_fee, total_amount) 
             VALUES ($1, 'REF123', $2, $3, '2024-01-01', '2024-01-02', 1, 1, 1000, 100, 1100)`,
            [bookingId, userId, propertyId]
        );

        // 4. Init Payment
        console.log('Calling initializePayment...');
        try {
            await paymentService.initializePayment(userId, bookingId, 1100, 'test-pay@example.com');
        } catch (e) {
            console.log('Caught expected axios error (Paystack key likely missing/invalid):', e.message);
        }

        // 5. Check DB
        const res = await query('SELECT * FROM payments WHERE booking_id = $1', [bookingId]);
        console.log('Retrieving payment record...');

        if (res.rows.length > 0) {
            const p = res.rows[0];
            console.log('✅ Payment Record Found:');
            console.log(`- ID: ${p.id}`);
            console.log(`- Status: ${p.status}`);
            console.log(`- Amount: ${p.amount}`);
            console.log(`- Type: ${p.payment_type}`);

            if (p.id && p.amount === 1100) {
                console.log('TEST PASSED');
            } else {
                console.error('TEST FAILED: Invalid data');
            }
        } else {
            console.error('TEST FAILED: No payment record found in DB');
        }

    } catch (e) {
        console.error('TEST CRASHED:', e);
    }
}

test();
