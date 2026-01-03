const chatService = require('../services/chat.service');

class ChatController {
    // Get all conversations
    async getConversations(req, res, next) {
        try {
            const conversations = await chatService.getUserConversations(req.user.id);
            res.json({ success: true, data: { conversations } });
        } catch (error) {
            next(error);
        }
    }

    // Get messages in a conversation
    async getMessages(req, res, next) {
        try {
            const { conversationId } = req.params;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 50;

            const messages = await chatService.getMessages(conversationId, req.user.id, { page, limit });
            res.json({ success: true, data: { messages } });
        } catch (error) {
            next(error);
        }
    }

    // Send message
    async sendMessage(req, res, next) {
        try {
            const { conversationId } = req.params;
            const { content, messageType, attachmentUrl } = req.body;

            if (!content) {
                return res.status(400).json({
                    success: false,
                    error: { message: 'Message content is required' }
                });
            }

            const message = await chatService.sendMessage(
                req.user.id,
                conversationId,
                content,
                messageType || 'TEXT',
                attachmentUrl
            );

            // Emit via Socket.io
            const io = req.app.get('io');
            if (io) {
                io.to(`conversation:${conversationId}`).emit('new_message', message);
            }

            res.status(201).json({ success: true, data: message });
        } catch (error) {
            next(error);
        }
    }

    // Start conversation about a property
    async startConversation(req, res, next) {
        try {
            const { hostId, propertyId, message } = req.body;

            if (!hostId) {
                return res.status(400).json({
                    success: false,
                    error: { message: 'Host ID is required' }
                });
            }

            const result = await chatService.startPropertyConversation(
                req.user.id,
                hostId,
                propertyId,
                message
            );

            res.status(201).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ChatController();
