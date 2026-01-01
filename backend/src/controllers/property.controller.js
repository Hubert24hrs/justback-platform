const propertyService = require('../services/property.service');
const Joi = require('joi');

class PropertyController {
    // Search properties
    async searchProperties(req, res, next) {
        try {
            const schema = Joi.object({
                city: Joi.string(),
                state: Joi.string(),
                minPrice: Joi.number().min(0),
                maxPrice: Joi.number().min(0),
                bedrooms: Joi.number().integer().min(1),
                propertyType: Joi.string().valid('hotel', 'apartment', 'house', 'shortlet', 'serviced_apartment'),
                amenities: Joi.array().items(Joi.string()),
                checkIn: Joi.date().iso(),
                checkOut: Joi.date().iso().greater(Joi.ref('checkIn')),
                guests: Joi.number().integer().min(1),
                page: Joi.number().integer().min(1).default(1),
                limit: Joi.number().integer().min(1).max(100).default(20)
            });

            const { error, value } = schema.validate(req.query);

            if (error) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: error.details[0].message
                    }
                });
            }

            const { page, limit, ...filters } = value;
            const result = await propertyService.searchProperties(filters, { page, limit });

            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    // Get property details
    async getPropertyById(req, res, next) {
        try {
            const property = await propertyService.getPropertyById(req.params.id);

            res.json({
                success: true,
                data: property
            });
        } catch (error) {
            next(error);
        }
    }

    // Create property (host only)
    async createProperty(req, res, next) {
        try {
            const schema = Joi.object({
                title: Joi.string().required(),
                description: Joi.string().required(),
                propertyType: Joi.string().valid('hotel', 'apartment', 'house', 'shortlet', 'serviced_apartment').required(),
                address: Joi.string().required(),
                city: Joi.string().required(),
                state: Joi.string().required(),
                country: Joi.string().default('Nigeria'),
                latitude: Joi.number(),
                longitude: Joi.number(),
                bedrooms: Joi.number().integer().min(1).required(),
                bathrooms: Joi.number().integer().min(1).required(),
                maxGuests: Joi.number().integer().min(1).required(),
                pricePerNight: Joi.number().min(0).required(),
                weeklyPrice: Joi.number().min(0),
                monthlyPrice: Joi.number().min(0),
                cleaningFee: Joi.number().min(0).default(0),
                amenities: Joi.array().items(Joi.string()),
                images: Joi.array().items(Joi.string().uri()),
                houseRules: Joi.string(),
                checkInTime: Joi.string().default('14:00'),
                checkOutTime: Joi.string().default('11:00'),
                cancellationPolicy: Joi.string().valid('24_hours', '48_hours', 'strict').default('24_hours')
            });

            const { error, value } = schema.validate(req.body);

            if (error) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: error.details[0].message
                    }
                });
            }

            const property = await propertyService.createProperty(req.user.id, value);

            res.status(201).json({
                success: true,
                data: property,
                message: 'Property created successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    // Update property
    async updateProperty(req, res, next) {
        try {
            const schema = Joi.object({
                title: Joi.string(),
                description: Joi.string(),
                pricePerNight: Joi.number().min(0),
                weeklyPrice: Joi.number().min(0),
                monthlyPrice: Joi.number().min(0),
                cleaningFee: Joi.number().min(0),
                amenities: Joi.array().items(Joi.string()),
                images: Joi.array().items(Joi.string().uri()),
                houseRules: Joi.string(),
                customFaqs: Joi.array().items(Joi.object({
                    question: Joi.string().required(),
                    answer: Joi.string().required(),
                    category: Joi.string()
                })),
                status: Joi.string().valid('DRAFT', 'ACTIVE', 'INACTIVE')
            });

            const { error, value } = schema.validate(req.body);

            if (error) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: error.details[0].message
                    }
                });
            }

            // Convert camelCase to snake_case
            const updates = {};
            if (value.pricePerNight !== undefined) updates.price_per_night = value.pricePerNight;
            if (value.weeklyPrice !== undefined) updates.weekly_price = value.weeklyPrice;
            if (value.monthlyPrice !== undefined) updates.monthly_price = value.monthlyPrice;
            if (value.cleaningFee !== undefined) updates.cleaning_fee = value.cleaningFee;
            if (value.houseRules !== undefined) updates.house_rules = value.houseRules;
            if (value.customFaqs !== undefined) updates.custom_faqs = value.customFaqs;
            if (value.title) updates.title = value.title;
            if (value.description) updates.description = value.description;
            if (value.amenities) updates.amenities = value.amenities;
            if (value.images) updates.images = value.images;
            if (value.status) updates.status = value.status;

            const property = await propertyService.updateProperty(req.params.id, req.user.id, updates);

            res.json({
                success: true,
                data: property,
                message: 'Property updated successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    // Check availability
    async checkAvailability(req, res, next) {
        try {
            const schema = Joi.object({
                startDate: Joi.date().iso().required(),
                endDate: Joi.date().iso().greater(Joi.ref('startDate')).required()
            });

            const { error, value } = schema.validate(req.query);

            if (error) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: error.details[0].message
                    }
                });
            }

            const availability = await propertyService.checkAvailability(
                req.params.id,
                value.startDate,
                value.endDate
            );

            res.json({
                success: true,
                data: availability
            });
        } catch (error) {
            next(error);
        }
    }

    // Get host's properties
    async getMyProperties(req, res, next) {
        try {
            const properties = await propertyService.getHostProperties(req.user.id);

            res.json({
                success: true,
                data: properties
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new PropertyController();
