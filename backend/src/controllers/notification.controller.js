const notificationService = require('../services/notification.service');

class NotificationController {
    // Register device for push notifications
    async registerDevice(req, res, next) {
        try {
            const { deviceToken, platform } = req.body;

            if (!deviceToken) {
                return res.status(400).json({
                    success: false,
                    error: { message: 'Device token is required' }
                });
            }

            const result = await notificationService.registerDevice(
                req.user.id,
                deviceToken,
                platform || 'android'
            );

            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    // Unregister device
    async unregisterDevice(req, res, next) {
        try {
            const { deviceToken } = req.body;
            const result = await notificationService.unregisterDevice(req.user.id, deviceToken);
            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    // Get notifications
    async getNotifications(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;

            const result = await notificationService.getUserNotifications(req.user.id, { page, limit });
            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    // Mark as read
    async markAsRead(req, res, next) {
        try {
            const { notificationId } = req.params;
            const result = await notificationService.markAsRead(req.user.id, notificationId);
            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    // Mark all as read
    async markAllAsRead(req, res, next) {
        try {
            const result = await notificationService.markAllAsRead(req.user.id);
            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new NotificationController();
