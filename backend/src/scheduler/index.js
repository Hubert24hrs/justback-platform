/**
 * JustBack Backend Scheduler
 * =========================
 * Production-ready cron job scheduler using node-cron.
 * Handles automated background tasks with logging, error handling, and retries.
 */

const cron = require('node-cron');
const { logger } = require('../utils/logger');

// Job Imports
const notificationJob = require('../jobs/notification.job');
const expiryCheckJob = require('../jobs/expiry-check.job');
const cleanupJob = require('../jobs/cleanup.job');
const backupJob = require('../jobs/backup.job');
const reminderJob = require('../jobs/reminder.job');

// Job registry for status tracking
const jobRegistry = new Map();

/**
 * Register a scheduled job with retry logic
 */
function registerJob(name, schedule, jobFn, options = {}) {
  const { maxRetries = 3, retryDelayMs = 5000 } = options;

  const wrappedJob = async () => {
    const startTime = Date.now();
    const jobInfo = { name, startTime, status: 'running', lastRun: new Date() };
    jobRegistry.set(name, jobInfo);

    logger.info(`[Scheduler] Starting job: ${name}`);

    let attempt = 0;
    let success = false;
    let lastError = null;

    while (attempt < maxRetries && !success) {
      attempt++;
      try {
        await jobFn();
        success = true;
        const duration = Date.now() - startTime;
        logger.info(`[Scheduler] Job completed: ${name} (${duration}ms)`);
        jobRegistry.set(name, { ...jobInfo, status: 'completed', duration, lastRun: new Date() });
      } catch (error) {
        lastError = error;
        logger.error(`[Scheduler] Job failed: ${name} (attempt ${attempt}/${maxRetries})`, error);
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelayMs));
        }
      }
    }

    if (!success) {
      logger.error(`[Scheduler] Job exhausted retries: ${name}`, lastError);
      jobRegistry.set(name, { ...jobInfo, status: 'failed', error: lastError?.message, lastRun: new Date() });
    }
  };

  // Validate cron expression
  if (!cron.validate(schedule)) {
    logger.error(`[Scheduler] Invalid cron expression for ${name}: ${schedule}`);
    return null;
  }

  const task = cron.schedule(schedule, wrappedJob, {
    scheduled: false, // Don't start immediately
    timezone: 'Africa/Lagos', // Nigerian timezone
  });

  logger.info(`[Scheduler] Registered job: ${name} (${schedule})`);
  return task;
}

/**
 * Initialize and start all scheduled jobs
 */
function initializeScheduler() {
  logger.info('[Scheduler] Initializing background job scheduler...');

  const jobs = [
    // ================== PUSH NOTIFICATIONS ==================
    // Send scheduled push notifications every 5 minutes
    registerJob('scheduled-notifications', '*/5 * * * *', notificationJob.processScheduledNotifications, {
      maxRetries: 2,
    }),

    // Check for booking reminders every 15 minutes
    registerJob('booking-reminders', '*/15 * * * *', reminderJob.processBookingReminders, {
      maxRetries: 2,
    }),

    // ================== SUBSCRIPTION & EXPIRY CHECKS ==================
    // Check for expiring bookings hourly
    registerJob('expiring-bookings', '0 * * * *', expiryCheckJob.checkExpiringBookings, {
      maxRetries: 3,
    }),

    // Check for payment timeouts every 30 minutes
    registerJob('payment-timeout-check', '*/30 * * * *', expiryCheckJob.checkPaymentTimeouts, {
      maxRetries: 2,
    }),

    // Process automatic checkout daily at 12:00 PM
    registerJob('auto-checkout', '0 12 * * *', expiryCheckJob.processAutoCheckout, {
      maxRetries: 3,
    }),

    // ================== DATABASE CLEANUP ==================
    // Clean up stale sessions daily at 3:00 AM
    registerJob('session-cleanup', '0 3 * * *', cleanupJob.cleanupStaleSessions, {
      maxRetries: 2,
    }),

    // Archive old logs weekly (Sunday at 2:00 AM)
    registerJob('log-archival', '0 2 * * 0', cleanupJob.archiveLogs, {
      maxRetries: 2,
    }),

    // Clean up abandoned bookings daily at 4:00 AM
    registerJob('abandoned-booking-cleanup', '0 4 * * *', cleanupJob.cleanupAbandonedBookings, {
      maxRetries: 2,
    }),

    // ================== PERIODIC BACKUPS ==================
    // Database backup daily at 1:00 AM
    registerJob('database-backup', '0 1 * * *', backupJob.performDatabaseBackup, {
      maxRetries: 3,
      retryDelayMs: 10000,
    }),

    // Analytics data export weekly (Monday at 5:00 AM)
    registerJob('analytics-export', '0 5 * * 1', backupJob.exportAnalyticsData, {
      maxRetries: 2,
    }),
  ];

  // Start all jobs
  jobs.filter(Boolean).forEach(job => job.start());
  logger.info(`[Scheduler] Started ${jobs.filter(Boolean).length} scheduled jobs`);

  return jobs;
}

/**
 * Get status of all registered jobs
 */
function getJobStatuses() {
  const statuses = {};
  for (const [name, info] of jobRegistry) {
    statuses[name] = info;
  }
  return statuses;
}

/**
 * Manually trigger a job by name
 */
async function triggerJob(jobName) {
  const jobMap = {
    'scheduled-notifications': notificationJob.processScheduledNotifications,
    'booking-reminders': reminderJob.processBookingReminders,
    'expiring-bookings': expiryCheckJob.checkExpiringBookings,
    'payment-timeout-check': expiryCheckJob.checkPaymentTimeouts,
    'auto-checkout': expiryCheckJob.processAutoCheckout,
    'session-cleanup': cleanupJob.cleanupStaleSessions,
    'log-archival': cleanupJob.archiveLogs,
    'abandoned-booking-cleanup': cleanupJob.cleanupAbandonedBookings,
    'database-backup': backupJob.performDatabaseBackup,
    'analytics-export': backupJob.exportAnalyticsData,
  };

  const jobFn = jobMap[jobName];
  if (!jobFn) {
    throw new Error(`Unknown job: ${jobName}`);
  }

  logger.info(`[Scheduler] Manually triggering job: ${jobName}`);
  await jobFn();
  logger.info(`[Scheduler] Manual job completed: ${jobName}`);
}

/**
 * Graceful shutdown
 */
function stopScheduler(jobs) {
  logger.info('[Scheduler] Stopping all scheduled jobs...');
  jobs.filter(Boolean).forEach(job => job.stop());
  logger.info('[Scheduler] All jobs stopped');
}

module.exports = {
  initializeScheduler,
  getJobStatuses,
  triggerJob,
  stopScheduler,
};
