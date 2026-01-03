const { connectDatabase, query } = require('../src/config/database');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function seedSqlite() {
    try {
        await connectDatabase();
        console.log('🌱 Starting SQLite seed...');
        const passwordHash = await bcrypt.hash('password123', 10);

        // 1. Users
        const users = [
            { email: 'admin@justback.com', role: 'admin', first: 'Super', last: 'Admin' },
            { email: 'host@test.com', role: 'host', first: 'Chidinma', last: 'Host' },
            { email: 'guest@test.com', role: 'guest', first: 'Chukwuemeka', last: 'Guest' }
        ];

        const userMap = {};

        for (const u of users) {
            console.log(`Processing user ${u.email}...`);
            // Insert
            await query(
                `INSERT OR IGNORE INTO users (id, email, phone, password_hash, first_name, last_name, role, email_verified)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, 1)`,
                ['u_' + u.role, u.email, '+234' + Math.floor(Math.random() * 1000000000), passwordHash, u.first, u.last, u.role]
            );

            // Fetch ID (since shim doesn't return rows for insert)
            const res = await query('SELECT id FROM users WHERE email = $1', [u.email]);
            userMap[u.role] = res.rows[0].id;
        }

        // 2. Properties
        console.log('🏠 Seeding properties...');
        const hostId = userMap['host'];

        // Check if properties exist
        const propCheck = await query('SELECT count(*) as count FROM properties');

        if (propCheck.rows[0].count == 0) {
            const props = [
                { title: "Luxury Apt", price: 150000, type: "apartment", city: "Lagos" },
                { title: "Cozy Studio", price: 45000, type: "shortlet", city: "Abuja" }
            ];

            for (let i = 0; i < props.length; i++) {
                const p = props[i];
                await query(
                    `INSERT INTO properties (id, host_id, title, description, property_type, address, city, state, price_per_night, bedrooms, bathrooms, max_guests, status)
                     VALUES ($1, $2, $3, 'Desc', $4, 'Address', $5, 'State', $6, 1, 1, 2, 'ACTIVE')`,
                    ['p_' + i, hostId, p.title, p.type, p.city, p.price]
                );
            }
        }

        // 3. Bookings (for dashboard stats)
        console.log('📅 Seeding bookings...');
        const guestId = userMap['guest'];
        const propRes = await query('SELECT id FROM properties LIMIT 1');
        const propId = propRes.rows[0].id;

        await query(
            `INSERT INTO bookings (id, booking_reference, guest_id, host_id, property_id, check_in_date, check_out_date, nights, num_guests, subtotal, service_fee, total_amount, status)
             VALUES 
             ('b_1', 'REF001', $1, $2, $3, date('now', '-2 days'), date('now', '-1 days'), 1, 2, 45000, 5000, 50000, 'CONFIRMED'),
             ('b_2', 'REF002', $1, $2, $3, date('now', '+1 days'), date('now', '+3 days'), 2, 1, 90000, 10000, 100000, 'PENDING')`,
            [guestId, hostId, propId]
        );

        console.log('✅ SQLite Seed complete!');
        process.exit(0);

    } catch (err) {
        console.error('❌ Seed failed:', err);
        process.exit(1);
    }
}

seedSqlite();
