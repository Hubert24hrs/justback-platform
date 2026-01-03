/**
 * Database Seeder
 * Populates PostgreSQL with initial data
 */
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'justback_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres123',
});

const users = [
    { email: 'admin@justback.com', phone: '+2348000000000', firstName: 'Super', lastName: 'Admin', role: 'admin' },
    { email: 'guest@test.com', phone: '+2348012345678', firstName: 'Chukwuemeka', lastName: 'Okafor', role: 'guest' },
    { email: 'host@test.com', phone: '+2348087654321', firstName: 'Chidinma', lastName: 'Lagos', role: 'host' }
];

const properties = [
    {
        title: "Luxury 3-Bedroom Penthouse in Lekki Phase 1",
        description: "Experience the height of luxury in this stunning penthouse with panoramic views of the Atlantic Ocean. Features private elevator access, rooftop infinity pool, and 24/7 concierge service.",
        type: "apartment",
        address: "15 Admiralty Way",
        city: "Lagos",
        state: "Lagos",
        price: 150000,
        bedrooms: 3,
        bathrooms: 3,
        guests: 6,
        images: [
            "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
            "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
            "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800"
        ],
        amenities: ["WiFi", "Pool", "AC", "Gym", "Parking", "Security", "Chef"],
        category: "apartment"
    },
    {
        title: "Transcorp Hilton Royal Suite",
        description: "Presidential treatment awaits in our Royal Suite. Separate living and dining areas, marble bathroom with jacuzzi, and exclusive access to the Executive Lounge.",
        type: "hotel",
        address: "1 Aguiyi Ironsi St, Maitama",
        city: "Abuja",
        state: "FCT",
        price: 450000,
        bedrooms: 1,
        bathrooms: 2,
        guests: 2,
        images: [
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
            "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800"
        ],
        amenities: ["WiFi", "Pool", "Spa", "Gym", "Restaurant", "Bar", "24/7 Room Service"],
        category: "hotel"
    },
    {
        title: "Cozy Studio in GRA",
        description: "Perfect for business travelers or solo tourists. Modern studio apartment in the heart of GRA, close to major offices and nightlife.",
        type: "shortlet",
        address: "55 Aba Road",
        city: "Port Harcourt",
        state: "Rivers",
        price: 35000,
        bedrooms: 1,
        bathrooms: 1,
        guests: 2,
        images: [
            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
            "https://images.unsplash.com/photo-1522771753035-0a5866706d95?w=800"
        ],
        amenities: ["WiFi", "AC", "Generator", "Kitchenette", "Smart TV"],
        category: "shortlet"
    },
    {
        title: "Club Cubana VIP Lounge Access",
        description: "Experience the ultimate nightlife with VIP access to Club Cubana. Includes dedicated table, bottle service, and private security.",
        type: "serviced_apartment",
        address: "Adeola Odeku St",
        city: "Lagos",
        state: "Lagos",
        price: 250000,
        bedrooms: 0,
        bathrooms: 0,
        guests: 10,
        images: [
            "https://images.unsplash.com/photo-1574391884720-385e6837424d?w=800",
            "https://images.unsplash.com/photo-1566414792890-b5b13881395d?w=800"
        ],
        amenities: ["VIP Access", "Bottle Service", "Security", "Parking"],
        category: "nightlife"
    }
];

async function seed() {
    const client = await pool.connect();
    try {
        console.log('🌱 Starting seed...');
        const passwordHash = await bcrypt.hash('password123', 10);

        // 1. Seed Users
        console.log('👤 Seeding users...');
        const userMap = new Map();

        for (const u of users) {
            const res = await client.query(
                `INSERT INTO users (email, phone, password_hash, first_name, last_name, role, email_verified)
                 VALUES ($1, $2, $3, $4, $5, $6, true)
                 ON CONFLICT (email) DO UPDATE SET email=EXCLUDED.email
                 RETURNING id, role`,
                [u.email, u.phone, passwordHash, u.firstName, u.lastName, u.role]
            );
            userMap.set(u.role, res.rows[0].id);
        }

        // 2. Seed Properties
        console.log('🏠 Seeding properties...');
        const hostId = userMap.get('host');

        for (const p of properties) {
            await client.query(
                `INSERT INTO properties 
                (host_id, title, description, property_type, address, city, state, price_per_night, bedrooms, bathrooms, max_guests, amenities, images, status)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'ACTIVE')`,
                [hostId, p.title, p.description, p.type, p.address, p.city, p.state, p.price, p.bedrooms, p.bathrooms, p.guests, JSON.stringify(p.amenities), JSON.stringify(p.images)]
            );
        }

        console.log('✅ Seed complete!');
    } catch (err) {
        console.error('❌ User Seed failed:', err);
    } finally {
        client.release();
        process.exit(0);
    }
}

seed();
