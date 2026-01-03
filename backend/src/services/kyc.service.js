const { query } = require('../config/database');
const { logger } = require('../utils/logger');
const crypto = require('crypto');

class KYCService {
    // Submit KYC documents
    async submitKYC(userId, kycData) {
        const { documentType, documentNumber, documentUrl, selfieUrl } = kycData;

        // Check if user already has pending/approved KYC
        const existing = await query(
            'SELECT id, status FROM kyc_submissions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
            [userId]
        );

        if (existing.rows.length > 0) {
            const status = existing.rows[0].status;
            if (status === 'APPROVED') {
                const error = new Error('KYC already approved');
                error.statusCode = 400;
                error.code = 'KYC_ALREADY_APPROVED';
                throw error;
            }
            if (status === 'PENDING') {
                const error = new Error('KYC submission already pending review');
                error.statusCode = 400;
                error.code = 'KYC_PENDING';
                throw error;
            }
        }

        const submissionId = crypto.randomUUID();

        await query(
            `INSERT INTO kyc_submissions (id, user_id, document_type, document_number, document_url, selfie_url, status)
             VALUES ($1, $2, $3, $4, $5, $6, 'PENDING')`,
            [submissionId, userId, documentType, documentNumber, documentUrl || null, selfieUrl || null]
        );

        // Update user KYC status
        await query(
            "UPDATE users SET kyc_status = 'PENDING' WHERE id = $1",
            [userId]
        );

        return {
            submissionId,
            status: 'PENDING',
            message: 'KYC submitted successfully. Please wait for admin review.'
        };
    }

    // Get KYC status for user
    async getKYCStatus(userId) {
        const result = await query(
            `SELECT id, document_type, status, rejection_reason, created_at, reviewed_at
             FROM kyc_submissions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
            [userId]
        );

        if (result.rows.length === 0) {
            return {
                status: 'NOT_SUBMITTED',
                message: 'No KYC submission found. Please submit your documents.'
            };
        }

        const submission = result.rows[0];
        return {
            submissionId: submission.id,
            documentType: submission.document_type,
            status: submission.status,
            rejectionReason: submission.rejection_reason,
            submittedAt: submission.created_at,
            reviewedAt: submission.reviewed_at
        };
    }

    // Admin: Get pending KYC requests
    async getPendingKYC(pagination = {}) {
        const { page = 1, limit = 20 } = pagination;
        const offset = (page - 1) * limit;

        const countResult = await query(
            "SELECT COUNT(*) as count FROM kyc_submissions WHERE status = 'PENDING'"
        );
        const total = parseInt(countResult.rows[0].count);

        const result = await query(
            `SELECT k.*, u.email, u.first_name, u.last_name, u.phone
             FROM kyc_submissions k
             JOIN users u ON k.user_id = u.id
             WHERE k.status = 'PENDING'
             ORDER BY k.created_at ASC
             LIMIT $1 OFFSET $2`,
            [limit, offset]
        );

        return {
            submissions: result.rows.map(row => ({
                id: row.id,
                userId: row.user_id,
                user: {
                    email: row.email,
                    firstName: row.first_name,
                    lastName: row.last_name,
                    phone: row.phone
                },
                documentType: row.document_type,
                documentNumber: row.document_number,
                documentUrl: row.document_url,
                selfieUrl: row.selfie_url,
                submittedAt: row.created_at
            })),
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }

    // Admin: Approve KYC
    async approveKYC(submissionId, adminId) {
        const result = await query(
            'SELECT user_id, status FROM kyc_submissions WHERE id = $1',
            [submissionId]
        );

        if (result.rows.length === 0) {
            const error = new Error('KYC submission not found');
            error.statusCode = 404;
            throw error;
        }

        if (result.rows[0].status !== 'PENDING') {
            const error = new Error('KYC already processed');
            error.statusCode = 400;
            throw error;
        }

        const userId = result.rows[0].user_id;

        await query(
            `UPDATE kyc_submissions 
             SET status = 'APPROVED', reviewed_by = $1, reviewed_at = $2
             WHERE id = $3`,
            [adminId, new Date().toISOString(), submissionId]
        );

        await query(
            "UPDATE users SET kyc_status = 'APPROVED' WHERE id = $1",
            [userId]
        );

        logger.info(`KYC approved for user ${userId} by admin ${adminId}`);

        return { success: true, message: 'KYC approved successfully' };
    }

    // Admin: Reject KYC
    async rejectKYC(submissionId, adminId, reason) {
        const result = await query(
            'SELECT user_id, status FROM kyc_submissions WHERE id = $1',
            [submissionId]
        );

        if (result.rows.length === 0) {
            const error = new Error('KYC submission not found');
            error.statusCode = 404;
            throw error;
        }

        if (result.rows[0].status !== 'PENDING') {
            const error = new Error('KYC already processed');
            error.statusCode = 400;
            throw error;
        }

        const userId = result.rows[0].user_id;

        await query(
            `UPDATE kyc_submissions 
             SET status = 'REJECTED', rejection_reason = $1, reviewed_by = $2, reviewed_at = $3
             WHERE id = $4`,
            [reason, adminId, new Date().toISOString(), submissionId]
        );

        await query(
            "UPDATE users SET kyc_status = 'REJECTED' WHERE id = $1",
            [userId]
        );

        logger.info(`KYC rejected for user ${userId} by admin ${adminId}: ${reason}`);

        return { success: true, message: 'KYC rejected' };
    }
}

module.exports = new KYCService();
