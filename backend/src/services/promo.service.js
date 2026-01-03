const { query } = require('../config/database');
const crypto = require('crypto');

class PromoService {
    // Validate and apply promo code
    async validatePromo(code, userId, bookingAmount) {
        const result = await query(
            `SELECT * FROM promo_codes WHERE code = $1 AND status = 'ACTIVE'`,
            [code.toUpperCase()]
        );

        if (result.rows.length === 0) {
            return { valid: false, error: 'Invalid or expired promo code' };
        }

        const promo = result.rows[0];
        const now = new Date();

        // Check dates
        if (promo.valid_from && new Date(promo.valid_from) > now) {
            return { valid: false, error: 'Promo code not yet active' };
        }
        if (promo.valid_until && new Date(promo.valid_until) < now) {
            return { valid: false, error: 'Promo code has expired' };
        }

        // Check usage limit
        if (promo.max_uses && promo.used_count >= promo.max_uses) {
            return { valid: false, error: 'Promo code usage limit reached' };
        }

        // Check minimum amount
        if (promo.min_booking_amount && bookingAmount < promo.min_booking_amount) {
            return {
                valid: false,
                error: `Minimum booking amount is ₦${promo.min_booking_amount.toLocaleString()}`
            };
        }

        // Check if user already used this code
        const userUsage = await query(
            "SELECT id FROM promo_usage WHERE promo_code_id = $1 AND user_id = $2",
            [promo.id, userId]
        );

        if (userUsage.rows.length > 0 && !promo.multiple_use_allowed) {
            return { valid: false, error: 'You have already used this promo code' };
        }

        // Calculate discount
        let discount = 0;
        if (promo.discount_type === 'PERCENTAGE') {
            discount = (bookingAmount * promo.discount_value) / 100;
            if (promo.max_discount && discount > promo.max_discount) {
                discount = promo.max_discount;
            }
        } else {
            discount = promo.discount_value;
        }

        return {
            valid: true,
            promoId: promo.id,
            code: promo.code,
            discountType: promo.discount_type,
            discountValue: promo.discount_value,
            discountAmount: discount,
            finalAmount: bookingAmount - discount,
            description: promo.description
        };
    }

    // Apply promo to booking
    async applyPromo(promoId, userId, bookingId) {
        // Record usage
        await query(
            "INSERT INTO promo_usage (id, promo_code_id, user_id, booking_id) VALUES ($1, $2, $3, $4)",
            [crypto.randomUUID(), promoId, userId, bookingId]
        );

        // Increment usage count
        await query(
            "UPDATE promo_codes SET used_count = used_count + 1 WHERE id = $1",
            [promoId]
        );

        return { success: true };
    }

    // Admin: Create promo code
    async createPromo(promoData) {
        const {
            code, description, discountType, discountValue, maxDiscount,
            minBookingAmount, validFrom, validUntil, maxUses, multipleUseAllowed
        } = promoData;

        const promoId = crypto.randomUUID();

        await query(
            `INSERT INTO promo_codes (id, code, description, discount_type, discount_value, max_discount,
             min_booking_amount, valid_from, valid_until, max_uses, multiple_use_allowed, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'ACTIVE')`,
            [promoId, code.toUpperCase(), description, discountType, discountValue, maxDiscount || null,
                minBookingAmount || null, validFrom || null, validUntil || null, maxUses || null, multipleUseAllowed || false]
        );

        return { id: promoId, code: code.toUpperCase() };
    }

    // Admin: List promos
    async listPromos() {
        const result = await query(
            "SELECT * FROM promo_codes ORDER BY created_at DESC"
        );

        return result.rows.map(p => ({
            id: p.id,
            code: p.code,
            description: p.description,
            discountType: p.discount_type,
            discountValue: p.discount_value,
            maxDiscount: p.max_discount,
            usedCount: p.used_count,
            maxUses: p.max_uses,
            status: p.status,
            validFrom: p.valid_from,
            validUntil: p.valid_until
        }));
    }

    // Admin: Deactivate promo
    async deactivatePromo(promoId) {
        await query("UPDATE promo_codes SET status = 'INACTIVE' WHERE id = $1", [promoId]);
        return { success: true };
    }
}

module.exports = new PromoService();
