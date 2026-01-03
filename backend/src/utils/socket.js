const socketIo = require('socket.io');

let io;

const initSocket = (server) => {
    io = socketIo(server, {
        cors: {
            origin: "*", // Allow all for dev
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('🔌 New Client Connected:', socket.id);

        // Join a conversation room
        socket.on('join_conversation', (conversationId) => {
            socket.join(conversationId);
            console.log(`Socket ${socket.id} joined room ${conversationId}`);
        });

        // Leave conversation
        socket.on('leave_conversation', (conversationId) => {
            socket.leave(conversationId);
        });

        // Typing indicators
        socket.on('typing', (data) => {
            socket.to(data.conversationId).emit('user_typing', data.userId);
        });

        socket.on('stop_typing', (data) => {
            socket.to(data.conversationId).emit('user_stop_typing', data.userId);
        });

        socket.on('disconnect', () => {
            console.log('❌ Client Disconnected:', socket.id);
        });
    });

    return io;
};

const getIo = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

module.exports = { initSocket, getIo };
