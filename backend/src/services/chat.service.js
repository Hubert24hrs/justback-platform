const { query } = require('../config/database');
const crypto = require('crypto');
const notificationService = require('./notification.service');

class ChatService {
    // Get or create conversation between two users
    async getOrCreateConversation(userId1, userId2, propertyId = null) {
        // Check if conversation exists
        const existing = await query(
            `SELECT id FROM conversations 
             WHERE (participant1_id = $1 AND participant2_id = $2)
                OR (participant1_id = $2 AND participant2_id = $1)
             LIMIT 1`,
            [userId1, userId2]
        );

        if (existing.rows.length > 0) {
            return existing.rows[0].id;
        }

        // Create new conversation
        const conversationId = crypto.randomUUID();
        await query(
            `INSERT INTO conversations (id, participant1_id, participant2_id, property_id)
             VALUES ($1, $2, $3, $4)`,
            [conversationId, userId1, userId2, propertyId]
        );

        return conversationId;
    }

    // Get user's conversations
    async getUserConversations(userId) {
        const result = await query(
            `SELECT c.*, 
                    u1.first_name as p1_first_name, u1.last_name as p1_last_name, u1.avatar_url as p1_avatar,
                    u2.first_name as p2_first_name, u2.last_name as p2_last_name, u2.avatar_url as p2_avatar,
                    p.title as property_title, p.images as property_images,
                    (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
                    (SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_at,
                    (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND sender_id != $1 AND read = 0) as unread_count
             FROM conversations c
             LEFT JOIN users u1 ON c.participant1_id = u1.id
             LEFT JOIN users u2 ON c.participant2_id = u2.id
             LEFT JOIN properties p ON c.property_id = p.id
             WHERE c.participant1_id = $1 OR c.participant2_id = $1
             ORDER BY last_message_at DESC NULLS LAST`,
            [userId]
        );

        return result.rows.map(c => {
            const isP1 = c.participant1_id === userId;
            const otherUser = {
                id: isP1 ? c.participant2_id : c.participant1_id,
                firstName: isP1 ? c.p2_first_name : c.p1_first_name,
                lastName: isP1 ? c.p2_last_name : c.p1_last_name,
                avatarUrl: isP1 ? c.p2_avatar : c.p1_avatar
            };

            return {
                id: c.id,
                otherUser,
                property: c.property_id ? {
                    id: c.property_id,
                    title: c.property_title,
                    image: c.property_images ? JSON.parse(c.property_images)[0] : null
                } : null,
                lastMessage: c.last_message,
                lastMessageAt: c.last_message_at,
                unreadCount: parseInt(c.unread_count) || 0
            };
        });
    }

    // Get messages in a conversation
    async getMessages(conversationId, userId, pagination = {}) {
        const { page = 1, limit = 50 } = pagination;
        const offset = (page - 1) * limit;

        // Verify user is part of conversation
        const conv = await query(
            "SELECT id FROM conversations WHERE id = $1 AND (participant1_id = $2 OR participant2_id = $2)",
            [conversationId, userId]
        );

        if (conv.rows.length === 0) {
            const error = new Error('Conversation not found');
            error.statusCode = 404;
            throw error;
        }

        const result = await query(
            `SELECT m.*, u.first_name, u.last_name, u.avatar_url
             FROM messages m
             JOIN users u ON m.sender_id = u.id
             WHERE m.conversation_id = $1
             ORDER BY m.created_at DESC
             LIMIT $2 OFFSET $3`,
            [conversationId, limit, offset]
        );

        // Mark messages as read
        await query(
            "UPDATE messages SET read = 1 WHERE conversation_id = $1 AND sender_id != $2 AND read = 0",
            [conversationId, userId]
        );

        return result.rows.reverse().map(m => ({
            id: m.id,
            senderId: m.sender_id,
            senderName: `${m.first_name} ${m.last_name}`,
            senderAvatar: m.avatar_url,
            content: m.content,
            messageType: m.message_type,
            attachmentUrl: m.attachment_url,
            read: !!m.read,
            createdAt: m.created_at
        }));
    }

    // Send a message
    async sendMessage(senderId, conversationId, content, messageType = 'TEXT', attachmentUrl = null) {
        // Verify sender is part of conversation
        const conv = await query(
            "SELECT participant1_id, participant2_id FROM conversations WHERE id = $1",
            [conversationId]
        );

        if (conv.rows.length === 0) {
            const error = new Error('Conversation not found');
            error.statusCode = 404;
            throw error;
        }

        const { participant1_id, participant2_id } = conv.rows[0];
        if (senderId !== participant1_id && senderId !== participant2_id) {
            const error = new Error('Not authorized');
            error.statusCode = 403;
            throw error;
        }

        const recipientId = senderId === participant1_id ? participant2_id : participant1_id;
        const messageId = crypto.randomUUID();

        await query(
            `INSERT INTO messages (id, conversation_id, sender_id, content, message_type, attachment_url)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [messageId, conversationId, senderId, content, messageType, attachmentUrl]
        );

        // Update conversation last activity
        await query(
            "UPDATE conversations SET updated_at = $1 WHERE id = $2",
            [new Date().toISOString(), conversationId]
        );

        // Get sender info for notification
        const sender = await query("SELECT first_name FROM users WHERE id = $1", [senderId]);

        // Send push notification
        await notificationService.notifyNewMessage({
            recipientId,
            senderName: sender.rows[0]?.first_name || 'Someone',
            content,
            conversationId
        });

        return {
            id: messageId,
            conversationId,
            senderId,
            content,
            messageType,
            createdAt: new Date().toISOString()
        };
    }

    // Start conversation with host about a property
    async startPropertyConversation(guestId, hostId, propertyId, initialMessage) {
        const conversationId = await this.getOrCreateConversation(guestId, hostId, propertyId);

        if (initialMessage) {
            await this.sendMessage(guestId, conversationId, initialMessage);
        }

        return { conversationId };
    }
}

module.exports = new ChatService();
