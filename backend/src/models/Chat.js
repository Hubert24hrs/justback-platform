const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    senderId: { type: String, required: true },
    text: { type: String, required: true },
    read: { type: Boolean, default: false },
}, { timestamps: true });

const conversationSchema = new mongoose.Schema({
    participants: [{ type: String, required: true }], // User IDs
    lastMessage: { type: String },
    messages: [messageSchema],
}, { timestamps: true });

conversationSchema.index({ participants: 1 });

module.exports = mongoose.model('Conversation', conversationSchema);
