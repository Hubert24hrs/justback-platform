const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// If using SQLite, use file-based storage for logs
if (process.env.DB_TYPE === 'sqlite') {
    const LOG_FILE = path.join(__dirname, '../../logs/call_logs.json');

    // Ensure log directory exists
    const logDir = path.dirname(LOG_FILE);
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

    class MockCallLog {
        constructor(data) {
            this.data = { ...data, createdAt: new Date(), _id: Date.now().toString() };
        }

        async save() {
            let logs = [];
            try {
                if (fs.existsSync(LOG_FILE)) {
                    logs = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
                }
            } catch (e) { logs = []; }

            logs.push(this.data);
            fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2));
            return this.data;
        }

        static find(query = {}) {
            let logs = [];
            try {
                if (fs.existsSync(LOG_FILE)) {
                    logs = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
                }
            } catch (e) { logs = []; }

            // Simple filtering
            if (query.userId) {
                logs = logs.filter(l => l.userId === query.userId);
            }

            // Chainable mock
            return {
                sort: () => ({
                    limit: (n) => logs.slice(0, n)
                })
            };
        }

        static async create(data) {
            const log = new MockCallLog(data);
            return await log.save();
        }
    }

    module.exports = MockCallLog;
} else {
    // Mongoose Schema (Existing)
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
}
