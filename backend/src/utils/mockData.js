const { v4: uuidv4 } = require('uuid');

const MOCK_USERS = [
    {
        id: '1',
        email: 'user@justback.com',
        password_hash: '$2a$10$X7...', // dummy hash
        first_name: 'Test',
        last_name: 'User',
        phone: '+2348012345678',
        role: 'guest',
        avatar_url: 'https://i.pravatar.cc/150?u=1',
        email_verified: true,
        phone_verified: true,
        wallet_balance: 50000.00,
        created_at: new Date().toISOString()
    },
    {
        id: '2',
        email: 'host@justback.com',
        first_name: 'Emeka',
        last_name: 'Host',
        phone: '+2348087654321',
        role: 'host',
        avatar_url: 'https://i.pravatar.cc/150?u=2',
        email_verified: true,
        wallet_balance: 150000.00,
        created_at: new Date().toISOString()
    }
];

const MOCK_PROPERTIES = [
    // --- APARTMENTS ---
    {
        id: 'apt-001',
        title: 'Luxury 2BR Apartment in Lekki Phase 1',
        description: 'Experience luxury in this fully furnished 2-bedroom apartment located in the heart of Lekki Phase 1. Features high-speed internet, 24/7 power, and premium security.',
        property_type: 'apartment',
        category: 'apartment', // Custom category for frontend filtering
        address: '15 Admiralty Way',
        city: 'Lekki',
        state: 'Lagos',
        country: 'Nigeria',
        latitude: 6.45,
        longitude: 3.48,
        bedrooms: 2,
        bathrooms: 2,
        max_guests: 4,
        price_per_night: 85000,
        cleaning_fee: 5000,
        amenities: JSON.stringify(['WiFi', 'AC', 'Pool', 'Gym', 'Netflix', 'Kitchen']),
        images: JSON.stringify([
            'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=2080&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop'
        ]),
        average_rating: 4.8,
        review_count: 24,
        host_id: '2',
        status: 'ACTIVE',
        created_at: new Date().toISOString()
    },
    {
        id: 'apt-002',
        title: 'Modern Studio at Victoria Island',
        description: 'Perfect for business travelers. A sleek, modern studio apartment with workspace and amazing city views.',
        property_type: 'apartment',
        category: 'apartment',
        address: '10 Ozumba Mbadiwe',
        city: 'Victoria Island',
        state: 'Lagos',
        country: 'Nigeria',
        latitude: 6.43,
        longitude: 3.42,
        bedrooms: 1,
        bathrooms: 1,
        max_guests: 2,
        price_per_night: 60000,
        amenities: JSON.stringify(['WiFi', 'Work Desk', 'AC', 'Security', 'Elevator']),
        images: JSON.stringify([
            'https://images.unsplash.com/photo-1502005229766-939760a58531?q=80&w=1975&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=2070&auto=format&fit=crop'
        ]),
        average_rating: 4.5,
        review_count: 12,
        host_id: '2',
        status: 'ACTIVE',
        created_at: new Date().toISOString()
    },

    // --- HOTELS ---
    {
        id: 'hotel-001',
        title: 'Eko Atlantic Grand Hotel',
        description: '5-star luxury hotel with ocean view, spa, and world-class dining.',
        property_type: 'hotel',
        category: 'hotel',
        address: 'Eko Atlantic City',
        city: 'Lagos',
        state: 'Lagos',
        country: 'Nigeria',
        latitude: 6.41,
        longitude: 3.40,
        bedrooms: 1,
        bathrooms: 1,
        max_guests: 2,
        price_per_night: 150000,
        amenities: JSON.stringify(['Spa', 'Pool', 'Restaurant', 'Bar', 'Room Service', 'Gym']),
        images: JSON.stringify([
            'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070&auto=format&fit=crop'
        ]),
        average_rating: 4.9,
        review_count: 150,
        host_id: '2',
        status: 'ACTIVE',
        created_at: new Date().toISOString()
    },
    {
        id: 'hotel-002',
        title: 'Abuja Continental',
        description: 'Experience the capital in style. Located near the International Conference Centre.',
        property_type: 'hotel',
        category: 'hotel',
        address: 'Utako District',
        city: 'Abuja',
        state: 'FCT',
        country: 'Nigeria',
        latitude: 9.07,
        longitude: 7.39,
        bedrooms: 1,
        bathrooms: 1,
        max_guests: 2,
        price_per_night: 120000,
        amenities: JSON.stringify(['Conference Hall', 'Pool', 'Buffet', 'WiFi']),
        images: JSON.stringify([
            'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1571896349842-6e53ce41e887?q=80&w=2070&auto=format&fit=crop'
        ]),
        average_rating: 4.7,
        review_count: 85,
        host_id: '2',
        status: 'ACTIVE',
        created_at: new Date().toISOString()
    },

    // --- SHORTLETS ---
    {
        id: 'short-001',
        title: 'Cozy Budget Shortlet in Surulere',
        description: 'Affordable and clean shortlet apartment for budget travelers. Close to National Stadium.',
        property_type: 'shortlet',
        category: 'shortlet',
        address: 'Adeniran Ogunsanya',
        city: 'Surulere',
        state: 'Lagos',
        country: 'Nigeria',
        latitude: 6.49,
        longitude: 3.35,
        bedrooms: 1,
        bathrooms: 1,
        max_guests: 2,
        price_per_night: 25000,
        amenities: JSON.stringify(['WiFi', 'DSTV', 'Fan', 'Kitchenette']),
        images: JSON.stringify([
            'https://images.unsplash.com/photo-1556020685-ae41abfc9365?q=80&w=1974&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1484154218962-a1c002085d2f?q=80&w=2071&auto=format&fit=crop'
        ]),
        average_rating: 4.2,
        review_count: 30,
        host_id: '2',
        status: 'ACTIVE',
        created_at: new Date().toISOString()
    },
    {
        id: 'short-002',
        title: 'Executive Shortlet Ikeja GRA',
        description: 'Secure and serene environment near the airport.',
        property_type: 'shortlet',
        category: 'shortlet',
        address: 'Isaac John Street',
        city: 'Ikeja',
        state: 'Lagos',
        country: 'Nigeria',
        latitude: 6.58,
        longitude: 3.36,
        bedrooms: 3,
        bathrooms: 3,
        max_guests: 6,
        price_per_night: 95000,
        amenities: JSON.stringify(['Airport Pickup', '24/7 Power', 'Chef', 'WiFi']),
        images: JSON.stringify([
            'https://images.unsplash.com/photo-1616486338812-3dadae4b4f9d?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1616137466218-f487bc39a797?q=80&w=2070&auto=format&fit=crop'
        ]),
        average_rating: 4.6,
        review_count: 18,
        host_id: '2',
        status: 'ACTIVE',
        created_at: new Date().toISOString()
    },

    // --- NIGHTLIFE ---
    {
        id: 'night-001',
        title: 'VIP Table at Club Quilox',
        description: 'Book a VIP table at the most exclusive club in Lagos. Includes premium bottle service.',
        property_type: 'nightlife',
        category: 'nightlife',
        address: 'Ozumba Mbadiwe',
        city: 'Victoria Island',
        state: 'Lagos',
        country: 'Nigeria',
        latitude: 6.43,
        longitude: 3.42,
        bedrooms: 0,
        bathrooms: 0,
        max_guests: 10,
        price_per_night: 500000, // Table price
        amenities: JSON.stringify(['VIP Access', 'Bottle Service', 'Security', 'Private Host']),
        images: JSON.stringify([
            'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=2071&auto=format&fit=crop'
        ]),
        average_rating: 4.9,
        review_count: 55,
        host_id: '2',
        status: 'ACTIVE',
        created_at: new Date().toISOString()
    },
    {
        id: 'night-002',
        title: 'Beach Party - Moist Beach Club',
        description: 'All-access pass to the Friday night beach vibe. Live DJ and drinks.',
        property_type: 'nightlife',
        category: 'nightlife',
        address: 'Oniru Private Beach',
        city: 'Lagos',
        state: 'Lagos',
        country: 'Nigeria',
        latitude: 6.42,
        longitude: 3.44,
        bedrooms: 0,
        bathrooms: 0,
        max_guests: 1,
        price_per_night: 10000, // Ticket price
        amenities: JSON.stringify(['Beach Access', 'Drinks', 'Music', 'Parking']),
        images: JSON.stringify([
            'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1533174072545-e8d9859f6c0d?q=80&w=1974&auto=format&fit=crop'
        ]),
        average_rating: 4.5,
        review_count: 40,
        host_id: '2',
        status: 'ACTIVE',
        created_at: new Date().toISOString()
    }
];

module.exports = {
    MOCK_USERS,
    MOCK_PROPERTIES
};
