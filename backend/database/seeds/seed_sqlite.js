/**
 * SQLite Database Seeder
 */
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const dbPath = path.join(__dirname, '../../database/justback.sqlite');
const db = new sqlite3.Database(dbPath);

const users = [
    { email: 'admin@justback.com', phone: '+2348000000000', firstName: 'Super', lastName: 'Admin', role: 'admin' },
    { email: 'guest@test.com', phone: '+2348012345678', firstName: 'Chukwuemeka', lastName: 'Okafor', role: 'guest' },
    { email: 'host@test.com', phone: '+2348087654321', firstName: 'Chidinma', lastName: 'Lagos', role: 'host' }
];

const properties = [
    {
        title: "Luxury 3-Bedroom Penthouse in Lekki Phase 1",
        description: "Experience the height of luxury...",
        type: "apartment",
        address: "15 Admiralty Way",
        city: "Lagos",
        state: "Lagos",
        price: 150000,
        bedrooms: 3,
        bathrooms: 3,
        guests: 6,
        images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"],
        amenities: ["WiFi", "Pool", "AC"],
        category: "apartment"
    }
    // ... we can add more but one is enough for testing
];

async function seed() {
    console.log('🌱 Starting SQLite seed...');
    const passwordHash = await bcrypt.hash('password123', 10);

    db.serialize(() => {
        // 1. Seed Users
        const userMap = {}; // role -> id

        users.forEach(u => {
            const id = uuidv4();
            userMap[u.role] = id;
            db.run(
                `INSERT OR REPLACE INTO users (id, email, phone, password_hash, first_name, last_name, role, email_verified)
                 VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
                [id, u.email, u.phone, passwordHash, u.firstName, u.lastName, u.role],
                (err) => {
                    if (err) console.error('Error inserting user:', err.message);
                    else console.log(`Created user: ${u.email}`);
                }
            );
        });

        // 2. Seed Properties (wait a bit for async inserts technically, but serialize handles it mostly for run sequence)
        // However, userMap population happens in sync loop but IDs are pre-generated so it's fine.

        const hostId = userMap['host']; // This might be undefined inside serialize callback flow if logic was async query but we pre-gen IDs.

        // Wait for next tick to ensure users are queued? serialize() ensures sequential execution of statements.
        // But the userMap logic relies on knowing IDs. We generated them cleanly.

        properties.forEach(p => {
            const id = uuidv4();
            db.run(
                `INSERT INTO properties 
                (id, host_id, title, description, property_type, address, city, state, price_per_night, bedrooms, bathrooms, max_guests, amenities, images, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')`,
                [id, hostId, p.title, p.description, p.type, p.address, p.city, p.state, p.price, p.bedrooms, p.bathrooms, p.guests, JSON.stringify(p.amenities), JSON.stringify(p.images)],
                (err) => {
                    if (err) console.error('Error inserting property:', err.message);
                    else console.log(`Created property: ${p.title}`);
                }
            );
        });
    });

    // Wait 2s then exit
    setTimeout(() => {
        console.log('✅ Seed complete!');
        process.exit(0);
    }, 2000);
}

seed();
