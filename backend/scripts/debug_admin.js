const { connectDatabase, query } = require('../src/config/database');
const adminController = require('../src/controllers/admin.controller');
const bookingService = require('../src/services/booking.service');
const { v4: uuidv4 } = require('uuid');

async function run() {
    try {
        await connectDatabase();

        // Create dummy user and property if needed (or rely on seed)
        // Assume seed ran. Use existing host/guest/prop ? 
        // Or create fresh.

        const guestId = 'u_guest_' + Date.now();
        const hostId = 'u_host_' + Date.now();
        const propId = 'p_' + Date.now();
        const bookingId = uuidv4();

        // Insert dummy data
        await query("INSERT OR IGNORE INTO users (id, email, password_hash, first_name, last_name, role) VALUES ($1, 'g@d.com', 'hash', 'G', 'D', 'guest')", [guestId]);
        await query("INSERT OR IGNORE INTO users (id, email, password_hash, first_name, last_name, role) VALUES ($1, 'h@d.com', 'hash', 'H', 'D', 'host')", [hostId]);
        await query("INSERT INTO properties (id, host_id, title, description, property_type, address, city, state, price_per_night, bedrooms, bathrooms, max_guests, status) VALUES ($1, $2, 'Debug Prop', 'Desc', 'apartment', 'Addr', 'City', 'State', 1000, 1, 1, 1, 'ACTIVE')", [propId, hostId]);

        // Insert Booking
        await query(
            `INSERT INTO bookings (id, booking_reference, guest_id, host_id, property_id, check_in_date, check_out_date, nights, num_guests, subtotal, service_fee, total_amount, status)
             VALUES ($1, 'REF-DBG', $2, $3, $4, '2025-01-01', '2025-01-05', 4, 1, 4000, 400, 4400, 'PENDING')`,
            [bookingId, guestId, hostId, propId]
        );

        console.log('Dummy booking created:', bookingId);

        // Mock Req/Res
        const req = {
            params: { bookingId },
            body: { status: 'confirmed' }
        };
        const res = {
            json: (data) => console.log('Response JSON:', data),
            status: (code) => ({ json: (data) => console.log(`Response ${code}:`, data) })
        };
        const next = (err) => console.error('Controller Error:', err);

        // Call Controller
        await adminController.updateBookingStatus(req, res, next);

    } catch (err) {
        console.error('Script Error:', err);
    }
}

run();
