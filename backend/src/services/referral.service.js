const { query } = require('../config/database');
const crypto = require('crypto');

class ReferralService {
    // Generate unique referral code for user
    async generateReferralCode(userId) {
        // Check if user already has a code
        const existing = await query(
            "SELECT referral_code FROM users WHERE id = $1",
            [userId]
        );

        if (existing.rows[0]?.referral_code) {
            return existing.rows[0].referral_code;
        }

        // Generate unique code
        const code = this._generateCode();

        await query(
            "UPDATE users SET referral_code = $1 WHERE id = $2",
            [code, userId]
        );

        return code;
    }

    _generateCode() {
        return 'JB' + crypto.randomBytes(4).toString('hex').toUpperCase();
    }

    // Apply referral code during registration
    async applyReferralCode(newUserId, referralCode) {
        if (!referralCode) return null;

        // Find referrer
        const referrer = await query(
            "SELECT id, first_name, wallet_balance FROM users WHERE referral_code = $1",
            [referralCode.toUpperCase()]
        );

        if (referrer.rows.length === 0) {
            return { valid: false, message: 'Invalid referral code' };
        }

        const referrerId = referrer.rows[0].id;

        // Don't allow self-referral
        if (referrerId === newUserId) {
            return { valid: false, message: 'Cannot use your own referral code' };
        }

        // Record the referral
        const referralId = crypto.randomUUID();
        await query(
            `INSERT INTO referrals (id, referrer_id, referred_id, referral_code, status)
             VALUES ($1, $2, $3, $4, 'PENDING')`,
            [referralId, referrerId, newUserId, referralCode.toUpperCase()]
        );

        // Update new user's referred_by
        await query(
            "UPDATE users SET referred_by = $1 WHERE id = $2",
            [referrerId, newUserId]
        );

        return {
            valid: true,
            referralId,
            referrerName: referrer.rows[0].first_name,
            message: `Referred by ${referrer.rows[0].first_name}! Complete your first booking to unlock rewards.`
        };
    }

    // Complete referral and award bonuses (called after first successful booking)
    async completeReferral(userId) {
        const referral = await query(
            "SELECT * FROM referrals WHERE referred_id = $1 AND status = 'PENDING'",
            [userId]
        );

        if (referral.rows.length === 0) {
            return null; // No pending referral
        }

        const { id: referralId, referrer_id } = referral.rows[0];

        // Bonus amounts (configurable)
        const referrerBonus = parseFloat(process.env.REFERRER_BONUS || 1000); // ₦1,000
        const referredBonus = parseFloat(process.env.REFERRED_BONUS || 500);  // ₦500

        // Award referrer bonus
        await query(
            "UPDATE users SET wallet_balance = wallet_balance + $1 WHERE id = $2",
            [referrerBonus, referrer_id]
        );

        // Award referred user bonus
        await query(
            "UPDATE users SET wallet_balance = wallet_balance + $1 WHERE id = $2",
            [referredBonus, userId]
        );

        // Mark referral as completed
        await query(
            `UPDATE referrals SET status = 'COMPLETED', referrer_bonus = $1, referred_bonus = $2, completed_at = $3
             WHERE id = $4`,
            [referrerBonus, referredBonus, new Date().toISOString(), referralId]
        );

        // Record wallet transactions
        const txId1 = crypto.randomUUID();
        const txId2 = crypto.randomUUID();

        await query(
            `INSERT INTO wallet_transactions (id, user_id, amount, type, description, status)
             VALUES ($1, $2, $3, 'CREDIT', 'Referral bonus', 'COMPLETED')`,
            [txId1, referrer_id, referrerBonus]
        );

        await query(
            `INSERT INTO wallet_transactions (id, user_id, amount, type, description, status)
             VALUES ($1, $2, $3, 'CREDIT', 'Welcome bonus from referral', 'COMPLETED')`,
            [txId2, userId, referredBonus]
        );

        return {
            referrerBonus,
            referredBonus,
            message: 'Referral bonuses awarded!'
        };
    }

    // Get user's referral stats
    async getReferralStats(userId) {
        // Get or generate referral code
        const code = await this.generateReferralCode(userId);

        // Count successful referrals
        const stats = await query(
            `SELECT 
                COUNT(*) FILTER (WHERE status = 'COMPLETED') as completed_count,
                COUNT(*) FILTER (WHERE status = 'PENDING') as pending_count,
                COALESCE(SUM(referrer_bonus) FILTER (WHERE status = 'COMPLETED'), 0) as total_earned
             FROM referrals WHERE referrer_id = $1`,
            [userId]
        );

        const s = stats.rows[0];

        return {
            referralCode: code,
            shareLink: `https://justback.ng/r/${code}`,
            stats: {
                completedReferrals: parseInt(s.completed_count) || 0,
                pendingReferrals: parseInt(s.pending_count) || 0,
                totalEarned: parseFloat(s.total_earned) || 0
            },
            rewards: {
                referrerBonus: parseFloat(process.env.REFERRER_BONUS || 1000),
                referredBonus: parseFloat(process.env.REFERRED_BONUS || 500)
            }
        };
    }

    // Get referral history
    async getReferralHistory(userId) {
        const result = await query(
            `SELECT r.*, u.first_name, u.last_name
             FROM referrals r
             JOIN users u ON r.referred_id = u.id
             WHERE r.referrer_id = $1
             ORDER BY r.created_at DESC`,
            [userId]
        );

        return result.rows.map(r => ({
            id: r.id,
            referredUser: `${r.first_name} ${r.last_name?.[0]}.`,
            status: r.status,
            bonus: r.referrer_bonus,
            completedAt: r.completed_at,
            createdAt: r.created_at
        }));
    }
}

module.exports = new ReferralService();
