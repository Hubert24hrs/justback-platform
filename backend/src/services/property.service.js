const { query } = require('../config/database');
const redis = require('../config/redis');
const { MOCK_PROPERTIES } = require('../utils/mockData');
const logger = require('../utils/logger').logger || console;

class PropertyService {
    // Search properties with filters
    async searchProperties(filters = {}, pagination = {}) {
        // --- MOCK MODE ---
        if (process.env.MOCK_MODE === 'true') {
            const { page = 1, limit = 20 } = pagination;
            const { category, propertyType } = filters;

            let filtered = MOCK_PROPERTIES;

            // Apply filters
            if (category && category !== 'All') {
                filtered = filtered.filter(p => p.category === category || (p.property_type === category));
            }
            if (propertyType) {
                filtered = filtered.filter(p => p.property_type === propertyType);
            }

            // Pagination logic
            const startIndex = (page - 1) * limit;
            const endIndex = page * limit;
            const paginatedProperties = filtered.slice(startIndex, endIndex);

            // Map to response format
            const properties = paginatedProperties.map(prop => ({
                id: prop.id,
                title: prop.title,
                propertyType: prop.property_type,
                address: prop.address,
                city: prop.city,
                state: prop.state,
                bedrooms: prop.bedrooms,
                bathrooms: prop.bathrooms,
                maxGuests: prop.max_guests,
                pricePerNight: prop.price_per_night,
                images: typeof prop.images === 'string' ? JSON.parse(prop.images) : prop.images,
                amenities: typeof prop.amenities === 'string' ? JSON.parse(prop.amenities) : prop.amenities,
                averageRating: prop.average_rating,
                reviewCount: prop.review_count,
                category: prop.category,
                host: {
                    id: prop.host_id,
                    firstName: 'Emeka',
                    avatarUrl: 'https://i.pravatar.cc/150?u=2'
                },
                available: true
            }));

            return {
                properties,
                pagination: {
                    page,
                    limit,
                    total: filtered.length,
                    pages: Math.ceil(filtered.length / limit)
                }
            };
        }
        // --- END MOCK MODE ---
        const {
            city,
            state,
            minPrice,
            maxPrice,
            bedrooms,
            propertyType,
            amenities = [],
            checkIn,
            checkOut,
            guests
        } = filters;

        const { page = 1, limit = 20 } = pagination;
        const offset = (page - 1) * limit;

        // Build dynamic query
        let whereConditions = ['status = $1'];
        let params = ['ACTIVE'];
        let paramCount = 2;

        if (city) {
            whereConditions.push(`LOWER(city) = LOWER($${paramCount})`);
            params.push(city);
            paramCount++;
        }

        if (state) {
            whereConditions.push(`LOWER(state) = LOWER($${paramCount})`);
            params.push(state);
            paramCount++;
        }

        if (minPrice) {
            whereConditions.push(`price_per_night >= $${paramCount}`);
            params.push(minPrice);
            paramCount++;
        }

        if (maxPrice) {
            whereConditions.push(`price_per_night <= $${paramCount}`);
            params.push(maxPrice);
            paramCount++;
        }

        if (bedrooms) {
            whereConditions.push(`bedrooms >= $${paramCount}`);
            params.push(bedrooms);
            paramCount++;
        }

        if (propertyType) {
            whereConditions.push(`property_type = $${paramCount}`);
            params.push(propertyType);
            paramCount++;
        }

        if (guests) {
            whereConditions.push(`max_guests >= $${paramCount}`);
            params.push(guests);
            paramCount++;
        }

        if (amenities.length > 0) {
            // Check DB Type for array handling
            if (process.env.DB_TYPE === 'sqlite') {
                // SQLite doesn't support ?& array operator easily without extension.
                // We'll skip exact match or use LIKE for simple single amenity check if needed.
                // For MVP E2E, we might ignore this or use simplistic LIKE query if critical.
                // whereConditions.push(`amenities LIKE ...`);
            } else {
                whereConditions.push(`amenities ?& $${paramCount}`);
                params.push(amenities);
                paramCount++;
            }
        }

        const whereClause = whereConditions.join(' AND ');

        // Get total count
        const countResult = await query(
            `SELECT COUNT(*) as count FROM properties WHERE ${whereClause}`,
            params
        );
        const total = parseInt(countResult.rows[0].count);

        // Get properties
        const result = await query(
            `SELECT p.id, p.title, p.property_type, p.address, p.city, p.state,
              p.bedrooms, p.bathrooms, p.max_guests, p.price_per_night,
              p.images, p.amenities, p.average_rating, p.review_count,
              p.created_at,
              u.id as host_id, u.first_name as host_first_name, u.avatar_url as host_avatar
       FROM properties p
       JOIN users u ON p.host_id = u.id
       WHERE ${whereClause}
       ORDER BY p.created_at DESC
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
            [...params, limit, offset]
        );

        const properties = result.rows.map(prop => ({
            id: prop.id,
            title: prop.title,
            propertyType: prop.property_type,
            address: prop.address,
            city: prop.city,
            state: prop.state,
            bedrooms: prop.bedrooms,
            bathrooms: prop.bathrooms,
            maxGuests: prop.max_guests,
            pricePerNight: parseFloat(prop.price_per_night),
            images: typeof prop.images === 'string' ? JSON.parse(prop.images || '[]') : (prop.images || []),
            amenities: typeof prop.amenities === 'string' ? JSON.parse(prop.amenities || '[]') : (prop.amenities || []),
            averageRating: parseFloat(prop.average_rating) || 0,
            reviewCount: prop.review_count,
            host: {
                id: prop.host_id,
                firstName: prop.host_first_name,
                avatarUrl: prop.host_avatar
            },
            available: true // TODO: Check availability if dates provided
        }));

        return {
            properties,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }

    // Get property by ID
    async getPropertyById(propertyId) {
        // --- MOCK MODE ---
        if (process.env.MOCK_MODE === 'true') {
            const prop = MOCK_PROPERTIES.find(p => p.id === propertyId);
            if (!prop) {
                const error = new Error('Property not found');
                error.statusCode = 404;
                throw error;
            }

            return {
                id: prop.id,
                title: prop.title,
                description: prop.description,
                propertyType: prop.property_type,
                address: prop.address,
                city: prop.city,
                state: prop.state,
                country: prop.country,
                latitude: prop.latitude,
                longitude: prop.longitude,
                bedrooms: prop.bedrooms,
                bathrooms: prop.bathrooms,
                maxGuests: prop.max_guests,
                pricePerNight: prop.price_per_night,
                weeklyPrice: null,
                monthlyPrice: null,
                cleaningFee: prop.cleaning_fee,
                amenities: typeof prop.amenities === 'string' ? JSON.parse(prop.amenities) : prop.amenities,
                images: typeof prop.images === 'string' ? JSON.parse(prop.images) : prop.images,
                houseRules: "No smoking, No parties",
                checkInTime: "14:00",
                checkOutTime: "11:00",
                cancellationPolicy: "24_hours",
                customFaqs: [],
                averageRating: prop.average_rating,
                reviewCount: prop.review_count,
                status: prop.status,
                category: prop.category,
                host: {
                    id: prop.host_id,
                    firstName: 'Emeka',
                    lastName: 'Host',
                    avatarUrl: 'https://i.pravatar.cc/150?u=2',
                    hostSince: new Date().toISOString()
                },
                createdAt: prop.created_at,
                updatedAt: prop.created_at
            };
        }
        // --- END MOCK MODE ---
        const cacheKey = `property:${propertyId}`;

        // Try cache first (skip for SQLite)
        if (process.env.DB_TYPE !== 'sqlite') {
            try {
                const cached = await redis.get(cacheKey);
                if (cached) {
                    return JSON.parse(cached);
                }
            } catch (err) {
                // Silently fail redis error or log but don't crash
                // console.error('Redis error', err);
            }
        }

        const result = await query(
            `SELECT p.*, 
              u.id as host_id, u.first_name as host_first_name, 
              u.last_name as host_last_name, u.avatar_url as host_avatar,
              u.created_at as host_since
       FROM properties p
       JOIN users u ON p.host_id = u.id
       WHERE p.id = $1`,
            [propertyId]
        );

        if (result.rows.length === 0) {
            const error = new Error('Property not found');
            error.statusCode = 404;
            error.code = 'PROPERTY_NOT_FOUND';
            throw error;
        }

        const prop = result.rows[0];

        const property = {
            id: prop.id,
            title: prop.title,
            description: prop.description,
            propertyType: prop.property_type,
            address: prop.address,
            city: prop.city,
            state: prop.state,
            country: prop.country,
            latitude: parseFloat(prop.latitude),
            longitude: parseFloat(prop.longitude),
            bedrooms: prop.bedrooms,
            bathrooms: prop.bathrooms,
            maxGuests: prop.max_guests,
            pricePerNight: parseFloat(prop.price_per_night),
            weeklyPrice: prop.weekly_price ? parseFloat(prop.weekly_price) : null,
            monthlyPrice: prop.monthly_price ? parseFloat(prop.monthly_price) : null,
            cleaningFee: parseFloat(prop.cleaning_fee),
            amenities: typeof prop.amenities === 'string' ? JSON.parse(prop.amenities || '[]') : (prop.amenities || []),
            images: typeof prop.images === 'string' ? JSON.parse(prop.images || '[]') : (prop.images || []),
            houseRules: prop.house_rules,
            checkInTime: prop.check_in_time,
            checkOutTime: prop.check_out_time,
            cancellationPolicy: prop.cancellation_policy,
            customFaqs: typeof prop.custom_faqs === 'string' ? JSON.parse(prop.custom_faqs || '[]') : (prop.custom_faqs || []),
            averageRating: parseFloat(prop.average_rating) || 0,
            reviewCount: prop.review_count,
            status: prop.status,
            host: {
                id: prop.host_id,
                firstName: prop.host_first_name,
                lastName: prop.host_last_name,
                avatarUrl: prop.host_avatar,
                hostSince: prop.host_since
            },
            createdAt: prop.created_at,
            updatedAt: prop.updated_at
        };

        // Cache for 5 minutes (skip for SQLite)
        if (process.env.DB_TYPE !== 'sqlite') {
            try {
                await redis.set(cacheKey, JSON.stringify(property), { EX: 300 });
            } catch (err) {
                // console.error('Redis set error', err);
            }
        }

        return property;
    }

    // Create new property (host only)
    async createProperty(hostId, propertyData) {
        // --- MOCK MODE ---
        if (process.env.MOCK_MODE === 'true') {
            return {
                id: 'mock-new-prop-' + Date.now(),
                ...propertyData,
                host_id: hostId,
                status: 'DRAFT',
                created_at: new Date().toISOString()
            };
        }
        // --- END MOCK MODE ---
        const {
            title, description, propertyType, address, city, state, country = 'Nigeria',
            latitude, longitude, bedrooms, bathrooms, maxGuests,
            pricePerNight, weeklyPrice, monthlyPrice, cleaningFee = 0,
            amenities = [], images = [], houseRules, checkInTime = '14:00',
            checkOutTime = '11:00', cancellationPolicy = '24_hours'
        } = propertyData;

        const result = await query(
            `INSERT INTO properties (
        host_id, title, description, property_type, address, city, state, country,
        latitude, longitude, bedrooms, bathrooms, max_guests,
        price_per_night, weekly_price, monthly_price, cleaning_fee,
        amenities, images, house_rules, check_in_time, check_out_time, cancellation_policy,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
      RETURNING id, created_at`,
            [
                hostId, title, description, propertyType, address, city, state, country,
                latitude, longitude, bedrooms, bathrooms, maxGuests,
                pricePerNight, weeklyPrice, monthlyPrice, cleaningFee,
                JSON.stringify(amenities), JSON.stringify(images), houseRules,
                checkInTime, checkOutTime, cancellationPolicy, 'DRAFT'
            ]
        );

        return this.getPropertyById(result.rows[0].id);
    }

    // Update property
    async updateProperty(propertyId, hostId, updates) {
        // --- MOCK MODE ---
        if (process.env.MOCK_MODE === 'true') {
            return this.getPropertyById(propertyId);
        }
        // --- END MOCK MODE ---
        // Verify ownership
        const ownerCheck = await query(
            'SELECT host_id FROM properties WHERE id = $1',
            [propertyId]
        );

        if (ownerCheck.rows.length === 0) {
            const error = new Error('Property not found');
            error.statusCode = 404;
            throw error;
        }

        if (ownerCheck.rows[0].host_id !== hostId) {
            const error = new Error('Not authorized to update this property');
            error.statusCode = 403;
            error.code = 'FORBIDDEN';
            throw error;
        }

        const allowedFields = [
            'title', 'description', 'price_per_night', 'weekly_price', 'monthly_price',
            'cleaning_fee', 'amenities', 'images', 'house_rules', 'custom_faqs', 'status'
        ];

        const fields = [];
        const values = [];
        let paramCount = 1;

        Object.keys(updates).forEach(key => {
            if (allowedFields.includes(key)) {
                fields.push(`${key} = $${paramCount}`);
                const value = (key === 'amenities' || key === 'images' || key === 'custom_faqs')
                    ? JSON.stringify(updates[key])
                    : updates[key];
                values.push(value);
                paramCount++;
            }
        });

        if (fields.length === 0) {
            return this.getPropertyById(propertyId);
        }

        values.push(propertyId);

        await query(
            `UPDATE properties SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = $${paramCount}`,
            values
        );

        // Clear cache (skip for SQLite)
        if (process.env.DB_TYPE !== 'sqlite') {
            try {
                await redis.del(`property:${propertyId}`);
            } catch (err) {
                // console.error(err);
            }
        }

        return this.getPropertyById(propertyId);
    }

    // Check availability for dates
    async checkAvailability(propertyId, checkInDate, checkOutDate) {
        // --- MOCK MODE ---
        if (process.env.MOCK_MODE === 'true') {
            const property = await this.getPropertyById(propertyId);
            const nights = 3; // Mock
            const subtotal = property.pricePerNight * nights;
            return {
                available: true,
                nights,
                pricing: {
                    pricePerNight: property.pricePerNight,
                    subtotal,
                    cleaningFee: property.cleaningFee,
                    serviceFee: subtotal * 0.075,
                    total: subtotal + property.cleaningFee + (subtotal * 0.075)
                },
                checkIn: checkInDate,
                checkOut: checkOutDate
            };
        }
        // --- END MOCK MODE ---
        const result = await query(
            `SELECT date, status FROM availability
       WHERE property_id = $1 AND date >= $2 AND date < $3
       ORDER BY date`,
            [propertyId, checkInDate, checkOutDate]
        );

        const bookedDates = result.rows.filter(row => row.status !== 'AVAILABLE');

        if (bookedDates.length > 0) {
            return {
                available: false,
                blockedDates: bookedDates.map(d => d.date)
            };
        }

        // Calculate nights and pricing
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

        const property = await this.getPropertyById(propertyId);

        const subtotal = property.pricePerNight * nights;
        const cleaningFee = property.cleaningFee || 0;
        const serviceFee = subtotal * 0.075; // 7.5% service fee
        const total = subtotal + cleaningFee + serviceFee;

        return {
            available: true,
            nights,
            pricing: {
                pricePerNight: property.pricePerNight,
                subtotal,
                cleaningFee,
                serviceFee,
                total
            },
            checkIn: checkInDate,
            checkOut: checkOutDate
        };
    }

    // Get host's properties
    async getHostProperties(hostId) {
        // --- MOCK MODE ---
        if (process.env.MOCK_MODE === 'true') {
            return MOCK_PROPERTIES.filter(p => p.host_id === hostId).map(prop => ({
                id: prop.id,
                title: prop.title,
                propertyType: prop.property_type,
                city: prop.city,
                status: prop.status,
                pricePerNight: prop.price_per_night,
                averageRating: prop.average_rating,
                reviewCount: prop.review_count,
                createdAt: prop.created_at
            }));
        }
        // --- END MOCK MODE ---
        const result = await query(
            `SELECT id, title, property_type, city, status, price_per_night,
              average_rating, review_count, created_at
       FROM properties
       WHERE host_id = $1
       ORDER BY created_at DESC`,
            [hostId]
        );

        return result.rows.map(prop => ({
            id: prop.id,
            title: prop.title,
            propertyType: prop.property_type,
            city: prop.city,
            status: prop.status,
            pricePerNight: parseFloat(prop.price_per_night),
            averageRating: parseFloat(prop.average_rating) || 0,
            reviewCount: prop.review_count,
            createdAt: prop.created_at
        }));
    }
}

module.exports = new PropertyService();
