/**
 * Reminder Job
 * ============
 * Handles booking reminders and check-in/check-out notifications.
 */

const { logger } = require('../utils/logger');
const { query } = require('../config/database');

/**
 * Process booking reminders (24h before check-in/check-out)
 */
async function processBookingReminders() {
    logger.info('[ReminderJob] Processing booking reminders...');

    try {
        // Find bookings with check-in tomorrow
        const checkInReminders = await query(`
      SELECT b.id, b.check_in_date, b.guest_id, u.email, u.first_name,
             p.title as property_title
      FROM bookings b
      JOIN users u ON b.guest_id = u.id
      JOIN properties p ON b.property_id = p.id
      WHERE b.status = 'confirmed'
        AND b.check_in_date::date = CURRENT_DATE + INTERVAL '1 day'
        AND b.reminder_sent_check_in IS NULL
    `);

        for (const booking of checkInReminders.rows || []) {
            try {
                // Send check-in reminder notification
                logger.info(`[ReminderJob] Sending check-in reminder for booking ${booking.id}`);

                // TODO: Integrate with notification service
                // await NotificationService.sendBookingReminder(booking, 'check_in');

                // Mark reminder as sent
                await query(
                    'UPDATE bookings SET reminder_sent_check_in = NOW() WHERE id = $1',
                    [booking.id]
                );
            } catch (error) {
                logger.error(`[ReminderJob] Failed to send check-in reminder for ${booking.id}:`, error);
            }
        }

        // Find bookings with check-out tomorrow
        const checkOutReminders = await query(`
      SELECT b.id, b.check_out_date, b.guest_id, u.email, u.first_name,
             p.title as property_title
      FROM bookings b
      JOIN users u ON b.guest_id = u.id  
      JOIN properties p ON b.property_id = p.id
      WHERE b.status = 'confirmed'
        AND b.check_out_date::date = CURRENT_DATE + INTERVAL '1 day'
        AND b.reminder_sent_check_out IS NULL
    `);

        for (const booking of checkOutReminders.rows || []) {
            try {
                logger.info(`[ReminderJob] Sending check-out reminder for booking ${booking.id}`);

                // TODO: Integrate with notification service
                // await NotificationService.sendBookingReminder(booking, 'check_out');

                await query(
                    'UPDATE bookings SET reminder_sent_check_out = NOW() WHERE id = $1',
                    [booking.id]
                );
            } catch (error) {
                logger.error(`[ReminderJob] Failed to send check-out reminder for ${booking.id}:`, error);
            }
        }

        const totalProcessed = (checkInReminders.rows?.length || 0) + (checkOutReminders.rows?.length || 0);
        logger.info(`[ReminderJob] Processed ${totalProcessed} booking reminders`);
    } catch (error) {
        logger.error('[ReminderJob] Error processing reminders:', error);
        throw error;
    }
}

module.exports = {
    processBookingReminders,
};
