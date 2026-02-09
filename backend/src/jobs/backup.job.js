/**
 * Backup Job
 * ==========
 * Handles database backups and analytics data export.
 */

const { logger } = require('../utils/logger');
const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');

const execAsync = promisify(exec);

// Backup configuration
const BACKUP_DIR = process.env.BACKUP_DIR || path.join(__dirname, '../../backups');
const DB_TYPE = process.env.DB_TYPE || 'postgres';

/**
 * Perform database backup
 */
async function performDatabaseBackup() {
    logger.info('[BackupJob] Starting database backup...');

    try {
        // Ensure backup directory exists
        await fs.mkdir(BACKUP_DIR, { recursive: true });

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFileName = `justback_backup_${timestamp}`;

        if (DB_TYPE === 'sqlite') {
            // SQLite backup: simple file copy
            const sqlitePath = path.join(__dirname, '../../database/justback.sqlite');
            const backupPath = path.join(BACKUP_DIR, `${backupFileName}.sqlite`);

            try {
                await fs.copyFile(sqlitePath, backupPath);
                logger.info(`[BackupJob] SQLite backup created: ${backupPath}`);
            } catch (error) {
                logger.warn('[BackupJob] SQLite file not found, skipping backup');
            }
        } else {
            // PostgreSQL backup using pg_dump
            const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD } = process.env;
            const backupPath = path.join(BACKUP_DIR, `${backupFileName}.sql`);

            // Set PGPASSWORD environment variable for pg_dump
            const env = { ...process.env, PGPASSWORD: DB_PASSWORD };

            const command = `pg_dump -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} -F p -f "${backupPath}"`;

            try {
                await execAsync(command, { env });
                logger.info(`[BackupJob] PostgreSQL backup created: ${backupPath}`);
            } catch (error) {
                // pg_dump might not be available in dev environment
                logger.warn('[BackupJob] pg_dump failed, attempting alternative backup method');

                // Alternative: Export tables as JSON
                const { query } = require('../config/database');
                const tables = ['users', 'properties', 'bookings', 'payments', 'reviews'];
                const backupData = {};

                for (const table of tables) {
                    try {
                        const result = await query(`SELECT * FROM ${table}`);
                        backupData[table] = result.rows;
                    } catch (e) {
                        logger.warn(`[BackupJob] Could not backup table: ${table}`);
                    }
                }

                const jsonBackupPath = path.join(BACKUP_DIR, `${backupFileName}.json`);
                await fs.writeFile(jsonBackupPath, JSON.stringify(backupData, null, 2));
                logger.info(`[BackupJob] JSON backup created: ${jsonBackupPath}`);
            }
        }

        // Cleanup old backups (keep last 7)
        await cleanupOldBackups();

        logger.info('[BackupJob] Database backup completed');
    } catch (error) {
        logger.error('[BackupJob] Error performing database backup:', error);
        throw error;
    }
}

/**
 * Export analytics data for reporting
 */
async function exportAnalyticsData() {
    logger.info('[BackupJob] Exporting analytics data...');

    try {
        await fs.mkdir(BACKUP_DIR, { recursive: true });

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const exportPath = path.join(BACKUP_DIR, `analytics_export_${timestamp}.json`);

        const { query } = require('../config/database');

        // Aggregate analytics data
        const analyticsData = {
            exportDate: new Date().toISOString(),
            bookingStats: null,
            revenueStats: null,
            userStats: null,
        };

        try {
            // Booking statistics
            const bookingStats = await query(`
        SELECT 
          COUNT(*) as total_bookings,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
          COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
          COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as active,
          AVG(total_price) as avg_booking_value
        FROM bookings
        WHERE created_at > NOW() - INTERVAL '30 days'
      `);
            analyticsData.bookingStats = bookingStats.rows[0];

            // Revenue statistics
            const revenueStats = await query(`
        SELECT 
          SUM(amount) as total_revenue,
          COUNT(*) as total_transactions
        FROM payments
        WHERE status = 'completed'
          AND created_at > NOW() - INTERVAL '30 days'
      `);
            analyticsData.revenueStats = revenueStats.rows[0];

            // User statistics  
            const userStats = await query(`
        SELECT 
          COUNT(*) as total_users,
          COUNT(CASE WHEN role = 'host' THEN 1 END) as hosts,
          COUNT(CASE WHEN role = 'guest' THEN 1 END) as guests,
          COUNT(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 END) as new_users
        FROM users
      `);
            analyticsData.userStats = userStats.rows[0];
        } catch (error) {
            logger.warn('[BackupJob] Some analytics queries failed:', error.message);
        }

        await fs.writeFile(exportPath, JSON.stringify(analyticsData, null, 2));
        logger.info(`[BackupJob] Analytics export created: ${exportPath}`);
    } catch (error) {
        logger.error('[BackupJob] Error exporting analytics:', error);
        throw error;
    }
}

/**
 * Clean up old backup files (keep last 7)
 */
async function cleanupOldBackups() {
    try {
        const files = await fs.readdir(BACKUP_DIR);
        const backupFiles = files
            .filter(f => f.startsWith('justback_backup_'))
            .sort()
            .reverse();

        // Keep only the last 7 backups
        const filesToDelete = backupFiles.slice(7);

        for (const file of filesToDelete) {
            await fs.unlink(path.join(BACKUP_DIR, file));
            logger.debug(`[BackupJob] Deleted old backup: ${file}`);
        }

        if (filesToDelete.length > 0) {
            logger.info(`[BackupJob] Cleaned up ${filesToDelete.length} old backups`);
        }
    } catch (error) {
        logger.warn('[BackupJob] Error cleaning up old backups:', error.message);
    }
}

module.exports = {
    performDatabaseBackup,
    exportAnalyticsData,
};
