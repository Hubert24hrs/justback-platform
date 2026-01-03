const Conversation = require('../models/Chat');

exports.getConversations = async (req, res) => {
    try {
        const userId = req.user.id;
        const conversations = await Conversation.find({
            participants: userId
        }).sort({ updatedAt: -1 });

        res.status(200).json({
            success: true,
            data: conversations
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const { id } = req.params;
        const conversation = await Conversation.findById(id);

        if (!conversation) {
            return res.status(404).json({ success: false, message: 'Conversation not found' });
        }

        res.status(200).json({
            success: true,
            data: conversation.messages
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.sendMessage = async (req, res) => {
    try {
        const { recipientId, text } = req.body;
        const senderId = req.user.id;

        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, recipientId] }
        });

        if (!conversation) {
            conversation = new Conversation({
                participants: [senderId, recipientId]
            });
        }

        conversation.messages.push({ senderId, text });
        conversation.lastMessage = text;
        await conversation.save();

        // [NEW] Real-time Emit
        const io = req.app.get('io');
        if (io) {
            io.to(conversation._id.toString()).emit('new_message', {
                conversationId: conversation._id,
                message: {
                    senderId,
                    text,
                    createdAt: new Date(),
                    // In real app, populate user details
                }
            });
        }

        res.status(201).json({
            success: true,
            data: conversation
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
