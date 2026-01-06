const { query } = require('../config/database');
const { logger } = require('../utils/logger');

// Firebase Admin SDK - conditionally loaded
let admin = null;
let fcmEnabled = false;

// Initialize Firebase Admin if credentials are available
const initializeFirebase = () => {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        try {
            admin = require('firebase-admin');
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

            if (!admin.apps.length) {
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount)
                });
            }

            fcmEnabled = true;
            logger.info('✅ Firebase Admin SDK initialized');
        } catch (error) {
            logger.error('Failed to initialize Firebase Admin:', error.message);
        }
    } else {
        logger.info('ℹ️ Firebase Admin not configured - FCM disabled');
    }
};

// Initialize on module load
initializeFirebase();

class NotificationService {
    constructor() {
        this.fcmEnabled = fcmEnabled;
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

    // Send FCM push notification
    async _sendFCM(tokens, notification) {
        if (!this.fcmEnabled || !admin) {
            logger.info('FCM not enabled, skipping push notification');
            return { success: 0, failure: tokens.length };
        }

        const { title, body, data = {} } = notification;

        const message = {
            notification: { title, body },
            data: Object.fromEntries(
                Object.entries(data).map(([k, v]) => [k, String(v)])
            ),
            android: {
                priority: 'high',
                notification: {
                    sound: 'default',
                    channelId: 'justback_notifications'
                }
            },
            apns: {
                payload: {
                    aps: {
                        sound: 'default',
                        badge: 1
                    }
                }
            }
        };

        const results = { success: 0, failure: 0, invalidTokens: [] };

        for (const token of tokens) {
            try {
                await admin.messaging().send({ ...message, token });
                results.success++;
            } catch (error) {
                results.failure++;

                // Check for invalid token errors
                if (error.code === 'messaging/invalid-registration-token' ||
                    error.code === 'messaging/registration-token-not-registered') {
                    results.invalidTokens.push(token);
                }

                logger.warn(`FCM send failed for token: ${error.message}`);
            }
        }

        // Clean up invalid tokens
        if (results.invalidTokens.length > 0) {
            await this._removeInvalidTokens(results.invalidTokens);
        }

        return results;
    }

    // Remove invalid tokens from database
    async _removeInvalidTokens(tokens) {
        for (const token of tokens) {
            await query(
                "DELETE FROM device_tokens WHERE device_token = $1",
                [token]
            );
        }
        logger.info(`Removed ${tokens.length} invalid FCM tokens`);
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

        // Send via FCM
        const fcmResult = await this._sendFCM(
            tokens.rows.map(t => t.device_token),
            { title, body, data }
        );

        logger.info(`Notification sent to user ${userId}: ${title} (FCM: ${fcmResult.success}/${tokens.rows.length})`);
        return { sent: tokens.rows.length, notificationId, fcmResult };
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

    // ==================== NOTIFICATION TRIGGERS ====================

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

    async notifyCheckoutReminder(booking) {
        await this.sendToUser(booking.guestId, {
            title: '🏡 Your stay is complete!',
            body: `How was your stay at ${booking.propertyTitle}? Leave a review!`,
            data: {
                type: 'CHECKOUT_REMINDER',
                bookingId: booking.id,
                propertyId: booking.propertyId,
                propertyName: booking.propertyTitle
            }
        });
    }
}

module.exports = new NotificationService();
