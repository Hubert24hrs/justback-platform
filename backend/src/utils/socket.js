const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const { logger } = require('./logger');

let io;

const initSocket = (server) => {
    io = socketIo(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        },
        pingTimeout: 60000,
        pingInterval: 25000
    });

    // Authentication middleware for socket connections
    io.use((socket, next) => {
        const token = socket.handshake.auth.token || socket.handshake.query.token;

        if (!token) {
            // Allow anonymous connections for now (can be restricted in production)
            socket.userId = null;
            return next();
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
            socket.userId = decoded.userId || decoded.id;
            socket.userRole = decoded.role;
            next();
        } catch (err) {
            logger.warn('Socket auth failed:', err.message);
            next(); // Allow connection but without authenticated user
        }
    });

    io.on('connection', (socket) => {
        logger.info(`🔌 Client Connected: ${socket.id} | User: ${socket.userId || 'anonymous'}`);

        // Join user's personal room for notifications
        if (socket.userId) {
            socket.join(`user_${socket.userId}`);
            logger.info(`User ${socket.userId} joined personal room`);
        }

        // ==================== CONVERSATION EVENTS ====================

        // Join a conversation room
        socket.on('join_conversation', (conversationId) => {
            socket.join(`conv_${conversationId}`);
            logger.info(`Socket ${socket.id} joined conversation ${conversationId}`);

            // Notify others in room that user joined
            socket.to(`conv_${conversationId}`).emit('user_joined', {
                conversationId,
                userId: socket.userId
            });
        });

        // Leave conversation room
        socket.on('leave_conversation', (conversationId) => {
            socket.leave(`conv_${conversationId}`);

            // Notify others
            socket.to(`conv_${conversationId}`).emit('user_left', {
                conversationId,
                userId: socket.userId
            });
        });

        // ==================== MESSAGING EVENTS ====================

        // Handle real-time message sending
        socket.on('send_message', async (data) => {
            const { conversationId, content, messageType = 'TEXT', attachmentUrl = null } = data;

            if (!socket.userId) {
                socket.emit('error', { message: 'Authentication required' });
                return;
            }

            // Create message object
            const message = {
                id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                conversationId,
                senderId: socket.userId,
                content,
                messageType,
                attachmentUrl,
                createdAt: new Date().toISOString(),
                status: 'sent'
            };

            // Broadcast to all users in conversation room (including sender for confirmation)
            io.to(`conv_${conversationId}`).emit('new_message', message);

            // Acknowledge to sender
            socket.emit('message_sent', {
                tempId: data.tempId, // Client-side temporary ID for matching
                message
            });

            logger.info(`Message sent in conversation ${conversationId} by user ${socket.userId}`);
        });

        // Message read receipts
        socket.on('mark_read', (data) => {
            const { conversationId, messageIds } = data;

            // Notify other users that messages were read
            socket.to(`conv_${conversationId}`).emit('messages_read', {
                conversationId,
                messageIds,
                readBy: socket.userId,
                readAt: new Date().toISOString()
            });
        });

        // ==================== TYPING INDICATORS ====================

        socket.on('typing_start', (data) => {
            const { conversationId } = data;
            socket.to(`conv_${conversationId}`).emit('user_typing', {
                conversationId,
                userId: socket.userId,
                isTyping: true
            });
        });

        socket.on('typing_stop', (data) => {
            const { conversationId } = data;
            socket.to(`conv_${conversationId}`).emit('user_typing', {
                conversationId,
                userId: socket.userId,
                isTyping: false
            });
        });

        // ==================== PRESENCE ====================

        socket.on('update_presence', (data) => {
            const { status } = data; // 'online', 'away', 'busy'

            if (socket.userId) {
                // Broadcast to all connections
                socket.broadcast.emit('presence_update', {
                    userId: socket.userId,
                    status,
                    lastSeen: new Date().toISOString()
                });
            }
        });

        // ==================== DISCONNECT ====================

        socket.on('disconnect', (reason) => {
            logger.info(`❌ Client Disconnected: ${socket.id} | Reason: ${reason}`);

            if (socket.userId) {
                // Notify about user going offline
                socket.broadcast.emit('presence_update', {
                    userId: socket.userId,
                    status: 'offline',
                    lastSeen: new Date().toISOString()
                });
            }
        });

        // ==================== ERROR HANDLING ====================

        socket.on('error', (error) => {
            logger.error('Socket error:', error);
        });
    });

    logger.info('🚀 Socket.io initialized with real-time messaging support');
    return io;
};

const getIo = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

// Helper function to emit to a specific user
const emitToUser = (userId, event, data) => {
    if (io) {
        io.to(`user_${userId}`).emit(event, data);
    }
};

// Helper function to emit to a conversation
const emitToConversation = (conversationId, event, data) => {
    if (io) {
        io.to(`conv_${conversationId}`).emit(event, data);
    }
};

module.exports = { initSocket, getIo, emitToUser, emitToConversation };
