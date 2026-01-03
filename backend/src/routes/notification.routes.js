const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { authenticate } = require('../middleware/auth');

// Device registration
router.post('/devices', authenticate, notificationController.registerDevice);
router.delete('/devices', authenticate, notificationController.unregisterDevice);

// Notifications
router.get('/', authenticate, notificationController.getNotifications);
router.patch('/:notificationId/read', authenticate, notificationController.markAsRead);
router.patch('/read-all', authenticate, notificationController.markAllAsRead);

module.exports = router;
