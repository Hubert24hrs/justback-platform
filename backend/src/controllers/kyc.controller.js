const kycService = require('../services/kyc.service');
const Joi = require('joi');

class KYCController {
    // User: Submit KYC
    async submitKYC(req, res, next) {
        try {
            const schema = Joi.object({
                documentType: Joi.string().valid('NIN', 'BVN', 'PASSPORT', 'DRIVERS_LICENSE').required(),
                documentNumber: Joi.string().min(5).max(50).required(),
                documentUrl: Joi.string().uri().optional(),
                selfieUrl: Joi.string().uri().optional()
            });

            const { error, value } = schema.validate(req.body);
            if (error) {
                return res.status(400).json({
                    success: false,
                    error: { code: 'VALIDATION_ERROR', message: error.details[0].message }
                });
            }

            const result = await kycService.submitKYC(req.user.id, value);

            res.status(201).json({
                success: true,
                data: result,
                message: 'KYC submitted successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    // User: Get own KYC status
    async getMyKYCStatus(req, res, next) {
        try {
            const result = await kycService.getKYCStatus(req.user.id);
            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    // Admin: Get pending KYC
    async getPendingKYC(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;

            const result = await kycService.getPendingKYC({ page, limit });
            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    // Admin: Approve KYC
    async approveKYC(req, res, next) {
        try {
            const { submissionId } = req.params;
            const result = await kycService.approveKYC(submissionId, req.user.id);
            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    // Admin: Reject KYC
    async rejectKYC(req, res, next) {
        try {
            const { submissionId } = req.params;
            const { reason } = req.body;

            if (!reason) {
                return res.status(400).json({
                    success: false,
                    error: { code: 'VALIDATION_ERROR', message: 'Rejection reason is required' }
                });
            }

            const result = await kycService.rejectKYC(submissionId, req.user.id, reason);
            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new KYCController();
