/**
 * Cleanup Job
 * ===========
 * Handles database cleanup, session management, and log archival.
 */

const { logger } = require('../utils/logger');
const { query } = require('../config/database');
const fs = require('fs').promises;
const path = require('path');

/**
 * Clean up stale/expired sessions
 */
async function cleanupStaleSessions() {
    logger.info('[CleanupJob] Cleaning up stale sessions...');

    try {
        // Delete expired refresh tokens
        const result = await query(`
      DELETE FROM refresh_tokens
      WHERE expires_at < NOW()
      RETURNING id
    `);

        const deletedCount = result.rowCount || 0;
        logger.info(`[CleanupJob] Deleted ${deletedCount} expired refresh tokens`);

        // Delete old password reset tokens
        await query(`
      DELETE FROM password_reset_tokens
      WHERE expires_at < NOW()
    `);

        // Clear old rate limit records (if using database for rate limiting)
        await query(`
      DELETE FROM rate_limit_records
      WHERE created_at < NOW() - INTERVAL '24 hours'
    `);

        logger.info('[CleanupJob] Session cleanup completed');
    } catch (error) {
        logger.error('[CleanupJob] Error cleaning up sessions:', error);
        throw error;
    }
}

/**
 * Archive old log files
 */
async function archiveLogs() {
    logger.info('[CleanupJob] Archiving old logs...');

    const logsDir = path.join(__dirname, '../../logs');
    const archiveDir = path.join(__dirname, '../../logs/archive');

    try {
        // Ensure archive directory exists
        await fs.mkdir(archiveDir, { recursive: true });

        // Get all log files
        const files = await fs.readdir(logsDir);
        const now = Date.now();
        const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);

        let archivedCount = 0;

        for (const file of files) {
            if (file === 'archive' || !file.endsWith('.log')) continue;

            const filePath = path.join(logsDir, file);
            const stat = await fs.stat(filePath);

            // Archive files older than 7 days
            if (stat.mtime.getTime() < sevenDaysAgo) {
                const archivePath = path.join(archiveDir, `${Date.now()}_${file}`);
                await fs.rename(filePath, archivePath);
                archivedCount++;
                logger.debug(`[CleanupJob] Archived log: ${file}`);
            }
        }

        logger.info(`[CleanupJob] Archived ${archivedCount} log files`);
    } catch (error) {
        logger.error('[CleanupJob] Error archiving logs:', error);
        throw error;
    }
}

/**
 * Clean up abandoned bookings (never completed payment)
 */
async function cleanupAbandonedBookings() {
    logger.info('[CleanupJob] Cleaning up abandoned bookings...');

    try {
        // Delete bookings that have been pending for more than 24 hours
        const result = await query(`
      UPDATE bookings 
      SET status = 'expired',
          updated_at = NOW()
      WHERE status = 'pending'
        AND payment_status = 'pending'
        AND created_at < NOW() - INTERVAL '24 hours'
      RETURNING id
    `);

        const expiredCount = result.rowCount || 0;
        logger.info(`[CleanupJob] Expired ${expiredCount} abandoned bookings`);

        // Clean up old notifications (older than 90 days and read)
        await query(`
      DELETE FROM notifications
      WHERE read_at IS NOT NULL
        AND created_at < NOW() - INTERVAL '90 days'
    `);

        // Clean up old AI call logs (older than 30 days)
        // Note: This would use MongoDB if separate

        logger.info('[CleanupJob] Abandoned booking cleanup completed');
    } catch (error) {
        logger.error('[CleanupJob] Error cleaning up abandoned bookings:', error);
        throw error;
    }
}

module.exports = {
    cleanupStaleSessions,
    archiveLogs,
    cleanupAbandonedBookings,
};
