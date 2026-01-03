const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate); // Protect all chat routes

// Conversations
router.get('/conversations', chatController.getConversations);
router.post('/conversations', chatController.startConversation);

// Messages
router.get('/conversations/:conversationId/messages', chatController.getMessages);
router.post('/conversations/:conversationId/messages', chatController.sendMessage);

module.exports = router;
