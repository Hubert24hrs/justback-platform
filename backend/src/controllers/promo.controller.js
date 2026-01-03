const promoService = require('../services/promo.service');
const Joi = require('joi');

class PromoController {
    // Validate promo code
    async validatePromo(req, res, next) {
        try {
            const { code, amount } = req.body;

            if (!code || !amount) {
                return res.status(400).json({
                    success: false,
                    error: { message: 'Code and amount are required' }
                });
            }

            const result = await promoService.validatePromo(code, req.user.id, parseFloat(amount));
            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    // Admin: Create promo
    async createPromo(req, res, next) {
        try {
            const schema = Joi.object({
                code: Joi.string().min(3).max(20).required(),
                description: Joi.string().max(200).optional(),
                discountType: Joi.string().valid('PERCENTAGE', 'FIXED').required(),
                discountValue: Joi.number().positive().required(),
                maxDiscount: Joi.number().positive().optional(),
                minBookingAmount: Joi.number().positive().optional(),
                validFrom: Joi.date().optional(),
                validUntil: Joi.date().optional(),
                maxUses: Joi.number().integer().positive().optional(),
                multipleUseAllowed: Joi.boolean().optional()
            });

            const { error, value } = schema.validate(req.body);
            if (error) {
                return res.status(400).json({
                    success: false,
                    error: { message: error.details[0].message }
                });
            }

            const result = await promoService.createPromo(value);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    // Admin: List promos
    async listPromos(req, res, next) {
        try {
            const promos = await promoService.listPromos();
            res.json({ success: true, data: { promos } });
        } catch (error) {
            next(error);
        }
    }

    // Admin: Deactivate promo
    async deactivatePromo(req, res, next) {
        try {
            const result = await promoService.deactivatePromo(req.params.promoId);
            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new PromoController();
