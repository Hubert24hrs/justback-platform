const { connectDatabase, query } = require('../src/config/database');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function seedAdmin() {
    try {
        await connectDatabase();
        console.log('🌱 Creating admin user...');

        const hash = await bcrypt.hash('password123', 10);

        // SQLite compatible insert
        await query(
            `INSERT INTO users (id, email, phone, password_hash, first_name, last_name, role, email_verified)
             VALUES ('user_admin_001', 'admin@justback.com', '+2348000000000', $1, 'Super', 'Admin', 'admin', 1)
             ON CONFLICT(email) DO NOTHING`,
            [hash]
        );

        console.log('✅ Admin user created: admin@justback.com / password123');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seed failed:', err);
        process.exit(1);
    }
}

seedAdmin();
