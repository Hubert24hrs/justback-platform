/**
 * Scheduler Routes
 * ================
 * Admin endpoints for managing and monitoring scheduled jobs.
 * 
 * Security: All routes require admin authentication.
 */

const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const scheduler = require('../scheduler');
const { logger } = require('../utils/logger');

/**
 * @route   GET /api/v1/scheduler/status
 * @desc    Get status of all scheduled jobs
 * @access  Admin only
 */
router.get('/status', authenticate, authorize('admin'), async (req, res) => {
    try {
        const statuses = scheduler.getJobStatuses();
        res.json({
            success: true,
            data: {
                jobs: statuses,
                serverTime: new Date().toISOString(),
                timezone: 'Africa/Lagos',
            },
        });
    } catch (error) {
        logger.error('[SchedulerRoutes] Error getting job statuses:', error);
        res.status(500).json({ success: false, error: 'Failed to get job statuses' });
    }
});

/**
 * @route   POST /api/v1/scheduler/trigger/:jobName
 * @desc    Manually trigger a scheduled job
 * @access  Admin only
 */
router.post('/trigger/:jobName', authenticate, authorize('admin'), async (req, res) => {
    const { jobName } = req.params;

    try {
        logger.info(`[SchedulerRoutes] Admin ${req.user.id} triggered job: ${jobName}`);

        // Run job in background
        scheduler.triggerJob(jobName)
            .then(() => {
                logger.info(`[SchedulerRoutes] Job ${jobName} completed successfully`);
            })
            .catch((error) => {
                logger.error(`[SchedulerRoutes] Job ${jobName} failed:`, error);
            });

        res.json({
            success: true,
            message: `Job '${jobName}' has been triggered`,
            note: 'Job is running in background. Check /status endpoint for results.',
        });
    } catch (error) {
        logger.error(`[SchedulerRoutes] Error triggering job ${jobName}:`, error);
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to trigger job'
        });
    }
});

/**
 * @route   GET /api/v1/scheduler/jobs
 * @desc    Get list of available scheduled jobs
 * @access  Admin only
 */
router.get('/jobs', authenticate, authorize('admin'), async (req, res) => {
    const jobs = [
        {
            name: 'scheduled-notifications',
            description: 'Process and send scheduled push notifications',
            schedule: 'Every 5 minutes',
            cron: '*/5 * * * *',
        },
        {
            name: 'booking-reminders',
            description: 'Send check-in/check-out reminders',
            schedule: 'Every 15 minutes',
            cron: '*/15 * * * *',
        },
        {
            name: 'expiring-bookings',
            description: 'Check for expiring bookings and notify users',
            schedule: 'Every hour',
            cron: '0 * * * *',
        },
        {
            name: 'payment-timeout-check',
            description: 'Cancel unpaid bookings after timeout',
            schedule: 'Every 30 minutes',
            cron: '*/30 * * * *',
        },
        {
            name: 'auto-checkout',
            description: 'Process automatic checkout for completed stays',
            schedule: 'Daily at 12:00 PM',
            cron: '0 12 * * *',
        },
        {
            name: 'session-cleanup',
            description: 'Clean up expired sessions and tokens',
            schedule: 'Daily at 3:00 AM',
            cron: '0 3 * * *',
        },
        {
            name: 'log-archival',
            description: 'Archive old log files',
            schedule: 'Weekly (Sunday 2:00 AM)',
            cron: '0 2 * * 0',
        },
        {
            name: 'abandoned-booking-cleanup',
            description: 'Expire abandoned/unpaid bookings',
            schedule: 'Daily at 4:00 AM',
            cron: '0 4 * * *',
        },
        {
            name: 'database-backup',
            description: 'Perform automated database backup',
            schedule: 'Daily at 1:00 AM',
            cron: '0 1 * * *',
        },
        {
            name: 'analytics-export',
            description: 'Export analytics data for reporting',
            schedule: 'Weekly (Monday 5:00 AM)',
            cron: '0 5 * * 1',
        },
    ];

    res.json({
        success: true,
        data: {
            jobs,
            totalJobs: jobs.length,
        },
    });
});

/**
 * @route   GET /api/v1/scheduler/health
 * @desc    Health check for scheduler service
 * @access  Public (for monitoring)
 */
router.get('/health', (req, res) => {
    const statuses = scheduler.getJobStatuses();
    const jobCount = Object.keys(statuses).length;
    const failedJobs = Object.values(statuses).filter(j => j.status === 'failed').length;

    res.json({
        status: failedJobs === 0 ? 'healthy' : 'degraded',
        activeJobs: jobCount,
        failedJobs,
        timestamp: new Date().toISOString(),
    });
});

module.exports = router;
