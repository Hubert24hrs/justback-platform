const referralService = require('../services/referral.service');

class ReferralController {
    // Get referral stats and code
    async getStats(req, res, next) {
        try {
            const stats = await referralService.getReferralStats(req.user.id);
            res.json({ success: true, data: stats });
        } catch (error) {
            next(error);
        }
    }

    // Get referral history
    async getHistory(req, res, next) {
        try {
            const history = await referralService.getReferralHistory(req.user.id);
            res.json({ success: true, data: { referrals: history } });
        } catch (error) {
            next(error);
        }
    }

    // Validate referral code (for registration form)
    async validateCode(req, res, next) {
        try {
            const { code } = req.params;

            const result = await require('../config/database').query(
                "SELECT first_name FROM users WHERE referral_code = $1",
                [code.toUpperCase()]
            );

            if (result.rows.length === 0) {
                return res.json({ success: true, data: { valid: false } });
            }

            res.json({
                success: true,
                data: {
                    valid: true,
                    referrerName: result.rows[0].first_name,
                    bonus: parseFloat(process.env.REFERRED_BONUS || 500)
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ReferralController();
