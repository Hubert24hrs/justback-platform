const io = require('socket.io-client');

console.log('🚀 Connecting to Real-Time Server...');
const socket = io('http://localhost:5000');

socket.on('connect', () => {
    console.log('✅ Connected to Server! Socket ID:', socket.id);

    // Simulate joining a chat
    const chatId = 'test_room_1';
    console.log(`➡️ Joining conversation: ${chatId}`);
    socket.emit('join_conversation', chatId);

    // Simulate typing event
    console.log('✍️ Sending "typing" event...');
    socket.emit('typing', { conversationId: chatId, userId: 'tester_1' });

    setTimeout(() => {
        console.log('🛑 Test successful! Disconnecting...');
        socket.disconnect();
        process.exit(0);
    }, 7000); // Run for 3 seconds
});

socket.on('connect_error', (err) => {
    console.error('❌ Connection Failed:', err.message);
    process.exit(1);
});

socket.on('disconnect', () => {
    console.log('❌ Disconnected');
});
