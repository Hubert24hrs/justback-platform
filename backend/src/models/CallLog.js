const mongoose = require('mongoose');

const CallLogSchema = new mongoose.Schema({
    callSid: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: String,
        ref: 'User'
    },
    phoneNumber: String,

    // Call details
    direction: {
        type: String,
        enum: ['inbound', 'outbound']
    },
    duration: Number,
    recordingUrl: String,

    // Conversation
    transcript: [{
        speaker: {
            type: String,
            enum: ['customer', 'ai', 'agent']
        },
        text: String,
        timestamp: Date,
        confidence: Number
    }],

    // RAG details
    retrievedDocuments: [{
        documentId: String,
        documentType: String,
        relevanceScore: Number,
        content: String
    }],

    // Outcome
    resolvedByAI: Boolean,
    escalatedToHuman: Boolean,
    escalationReason: String,
    humanAgentId: String,

    // Intent classification
    intents: [String],

    // Metadata
    propertyId: String,
    bookingId: String,

    // Quality metrics
    averageConfidence: Number,
    customerSatisfaction: Number,

    status: {
        type: String,
        enum: ['initiated', 'active', 'completed', 'failed'],
        default: 'initiated'
    },

    endedAt: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('CallLog', CallLogSchema);
