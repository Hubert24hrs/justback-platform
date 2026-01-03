const { query } = require('../config/database');
const { logger } = require('../utils/logger');

// Firebase Admin SDK would be used in production
// For now, we'll create the infrastructure that can be connected to FCM

class NotificationService {
    constructor() {
        this.fcmEnabled = !!process.env.FIREBASE_SERVICE_ACCOUNT;
        // In production, initialize Firebase Admin SDK here
    }

    // Register device token for push notifications
    async registerDevice(userId, deviceToken, platform = 'android') {
        // Check if token already exists
        const existing = await query(
            "SELECT id FROM device_tokens WHERE user_id = $1 AND device_token = $2",
            [userId, deviceToken]
        );

        if (existing.rows.length > 0) {
            // Update last active
            await query(
                "UPDATE device_tokens SET last_active = $1 WHERE user_id = $2 AND device_token = $3",
                [new Date().toISOString(), userId, deviceToken]
            );
            return { success: true, message: 'Device already registered' };
        }

        await query(
            `INSERT INTO device_tokens (id, user_id, device_token, platform, last_active)
             VALUES ($1, $2, $3, $4, $5)`,
            [require('crypto').randomUUID(), userId, deviceToken, platform, new Date().toISOString()]
        );

        return { success: true, message: 'Device registered successfully' };
    }

    // Remove device token (on logout)
    async unregisterDevice(userId, deviceToken) {
        await query(
            "DELETE FROM device_tokens WHERE user_id = $1 AND device_token = $2",
            [userId, deviceToken]
        );
        return { success: true };
    }

    // Send push notification to user
    async sendToUser(userId, notification) {
        const { title, body, data = {} } = notification;

        // Get user's device tokens
        const tokens = await query(
            "SELECT device_token, platform FROM device_tokens WHERE user_id = $1",
            [userId]
        );

        if (tokens.rows.length === 0) {
            logger.info(`No device tokens for user ${userId}`);
            return { sent: 0 };
        }

        // Store notification in database
        const notificationId = require('crypto').randomUUID();
        await query(
            `INSERT INTO notifications (id, user_id, title, body, data, type)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [notificationId, userId, title, body, JSON.stringify(data), data.type || 'GENERAL']
        );

        // In production, send via FCM
        if (this.fcmEnabled) {
            // await this._sendFCM(tokens.rows.map(t => t.device_token), { title, body, data });
        }

        logger.info(`Notification sent to user ${userId}: ${title}`);
        return { sent: tokens.rows.length, notificationId };
    }

    // Send to multiple users
    async sendToMultiple(userIds, notification) {
        const results = await Promise.all(
            userIds.map(userId => this.sendToUser(userId, notification))
        );
        return { totalSent: results.reduce((sum, r) => sum + r.sent, 0) };
    }

    // Get user's notifications
    async getUserNotifications(userId, pagination = {}) {
        const { page = 1, limit = 20 } = pagination;
        const offset = (page - 1) * limit;

        const result = await query(
            `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );

        const unreadCount = await query(
            "SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND read = 0",
            [userId]
        );

        return {
            notifications: result.rows.map(n => ({
                id: n.id,
                title: n.title,
                body: n.body,
                data: JSON.parse(n.data || '{}'),
                type: n.type,
                read: !!n.read,
                createdAt: n.created_at
            })),
            unreadCount: parseInt(unreadCount.rows[0].count),
            pagination: { page, limit }
        };
    }

    // Mark notification as read
    async markAsRead(userId, notificationId) {
        await query(
            "UPDATE notifications SET read = 1 WHERE id = $1 AND user_id = $2",
            [notificationId, userId]
        );
        return { success: true };
    }

    // Mark all as read
    async markAllAsRead(userId) {
        await query(
            "UPDATE notifications SET read = 1 WHERE user_id = $1 AND read = 0",
            [userId]
        );
        return { success: true };
    }

    // Notification triggers
    async notifyBookingCreated(booking) {
        await this.sendToUser(booking.hostId, {
            title: '🏠 New Booking Request!',
            body: `${booking.guestName} wants to book ${booking.propertyTitle}`,
            data: { type: 'BOOKING_CREATED', bookingId: booking.id }
        });
    }

    async notifyBookingConfirmed(booking) {
        await this.sendToUser(booking.guestId, {
            title: '✅ Booking Confirmed!',
            body: `Your booking at ${booking.propertyTitle} is confirmed`,
            data: { type: 'BOOKING_CONFIRMED', bookingId: booking.id }
        });
    }

    async notifyPaymentReceived(payment) {
        await this.sendToUser(payment.hostId, {
            title: '💰 Payment Received!',
            body: `You received ₦${payment.amount.toLocaleString()} for ${payment.propertyTitle}`,
            data: { type: 'PAYMENT_RECEIVED', paymentId: payment.id }
        });
    }

    async notifyNewMessage(message) {
        await this.sendToUser(message.recipientId, {
            title: `💬 Message from ${message.senderName}`,
            body: message.content.substring(0, 100),
            data: { type: 'NEW_MESSAGE', conversationId: message.conversationId }
        });
    }

    async notifyNewReview(review) {
        await this.sendToUser(review.hostId, {
            title: '⭐ New Review!',
            body: `You received a ${review.rating}-star review for ${review.propertyTitle}`,
            data: { type: 'NEW_REVIEW', reviewId: review.id, propertyId: review.propertyId }
        });
    }
}

module.exports = new NotificationService();
