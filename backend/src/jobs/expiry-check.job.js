/**
 * Expiry Check Job
 * ================
 * Handles subscription/expiry checks, payment timeouts, and automatic checkout.
 */

const { logger } = require('../utils/logger');
const { query } = require('../config/database');

/**
 * Check for bookings expiring soon and notify hosts/guests
 */
async function checkExpiringBookings() {
    logger.info('[ExpiryCheckJob] Checking for expiring bookings...');

    try {
        // Find bookings expiring in next 48 hours
        const expiringBookings = await query(`
      SELECT b.id, b.check_out_date, b.guest_id, b.status,
             u.email as guest_email, u.first_name as guest_name,
             p.title as property_title, p.host_id,
             h.email as host_email, h.first_name as host_name
      FROM bookings b
      JOIN users u ON b.guest_id = u.id
      JOIN properties p ON b.property_id = p.id
      JOIN users h ON p.host_id = h.id
      WHERE b.status = 'confirmed'
        AND b.check_out_date BETWEEN NOW() AND NOW() + INTERVAL '48 hours'
        AND b.expiry_notification_sent IS NULL
    `);

        for (const booking of expiringBookings.rows || []) {
            try {
                logger.info(`[ExpiryCheckJob] Sending expiry notification for booking ${booking.id}`);

                // TODO: Send notifications to both guest and host
                // await NotificationService.sendExpiryAlert(booking);

                await query(
                    'UPDATE bookings SET expiry_notification_sent = NOW() WHERE id = $1',
                    [booking.id]
                );
            } catch (error) {
                logger.error(`[ExpiryCheckJob] Failed to process booking ${booking.id}:`, error);
            }
        }

        logger.info(`[ExpiryCheckJob] Processed ${expiringBookings.rows?.length || 0} expiring bookings`);
    } catch (error) {
        logger.error('[ExpiryCheckJob] Error checking expiring bookings:', error);
        throw error;
    }
}

/**
 * Check for payment timeouts and cancel unpaid bookings
 */
async function checkPaymentTimeouts() {
    logger.info('[ExpiryCheckJob] Checking for payment timeouts...');

    try {
        // Find pending bookings older than 30 minutes without payment
        const timedOutBookings = await query(`
      SELECT b.id, b.created_at, b.guest_id
      FROM bookings b
      WHERE b.status = 'pending'
        AND b.payment_status = 'pending'
        AND b.created_at < NOW() - INTERVAL '30 minutes'
    `);

        for (const booking of timedOutBookings.rows || []) {
            try {
                logger.info(`[ExpiryCheckJob] Cancelling timed-out booking ${booking.id}`);

                await query(
                    `UPDATE bookings 
           SET status = 'cancelled', 
               cancelled_at = NOW(),
               cancellation_reason = 'Payment timeout'
           WHERE id = $1`,
                    [booking.id]
                );

                // TODO: Send cancellation notification
                // await NotificationService.sendPaymentTimeoutNotice(booking);
            } catch (error) {
                logger.error(`[ExpiryCheckJob] Failed to cancel booking ${booking.id}:`, error);
            }
        }

        logger.info(`[ExpiryCheckJob] Cancelled ${timedOutBookings.rows?.length || 0} timed-out bookings`);
    } catch (error) {
        logger.error('[ExpiryCheckJob] Error checking payment timeouts:', error);
        throw error;
    }
}

/**
 * Process automatic checkout for completed stays
 */
async function processAutoCheckout() {
    logger.info('[ExpiryCheckJob] Processing automatic checkouts...');

    try {
        // Find bookings past their check-out date
        const completedBookings = await query(`
      SELECT b.id, b.check_out_date, b.guest_id, b.property_id
      FROM bookings b
      WHERE b.status = 'confirmed'
        AND b.check_out_date < CURRENT_DATE
    `);

        for (const booking of completedBookings.rows || []) {
            try {
                logger.info(`[ExpiryCheckJob] Auto-completing booking ${booking.id}`);

                await query(
                    `UPDATE bookings 
           SET status = 'completed', 
               completed_at = NOW()
           WHERE id = $1`,
                    [booking.id]
                );

                // Release escrow to host after completion
                // TODO: Integrate with payment service
                // await PaymentService.releaseEscrow(booking.id);
            } catch (error) {
                logger.error(`[ExpiryCheckJob] Failed to complete booking ${booking.id}:`, error);
            }
        }

        logger.info(`[ExpiryCheckJob] Completed ${completedBookings.rows?.length || 0} auto-checkouts`);
    } catch (error) {
        logger.error('[ExpiryCheckJob] Error processing auto-checkouts:', error);
        throw error;
    }
}

module.exports = {
    checkExpiringBookings,
    checkPaymentTimeouts,
    processAutoCheckout,
};
