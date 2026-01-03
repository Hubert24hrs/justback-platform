const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// Request AI callback (authenticated) - MOCK IMPLEMENTATION FOR DEMO
router.post('/request-call', authenticate, async (req, res, next) => {
    try {
        const { phoneNumber, context = 'inquiry' } = req.body;
        const userId = req.user.id;
        const callId = uuidv4();

        // Simulate AI conversation transcript
        const mockTranscript = JSON.stringify([
            { speaker: 'ai', text: `Hello! I understand you are calling about ${context}. How can I help you today?` },
            { speaker: 'customer', text: 'Yes, I would like to know more about the property availability.' },
            { speaker: 'ai', text: 'I can certainly check that for you. Please hold on a moment.' }
        ]);

        // Insert mock call log into SQLite
        const sql = `
            INSERT INTO call_logs (id, user_id, phone_number, direction, status, duration, average_confidence, transcript, created_at)
            VALUES (?, ?, ?, 'outbound', 'completed', 45, 0.92, ?, CURRENT_TIMESTAMP)
        `;

        // Using db.query wrapper which should handle array params for SQLite
        await db.query(sql, [callId, userId, phoneNumber, mockTranscript]);

        res.json({
            success: true,
            data: { callId, status: 'queued' },
            message: 'AI assistant is calling ' + phoneNumber
        });
    } catch (error) {
        next(error);
    }
});

// Get call logs (user sees only their calls)
router.get('/calls', authenticate, async (req, res, next) => {
    try {
        // Fetch logs from SQLite
        const sql = `
            SELECT * FROM call_logs 
            WHERE user_id = ? 
            ORDER BY created_at DESC 
            LIMIT 50
        `;
        const result = await db.query(sql, [req.user.id]);

        // Parse transcript JSON strings back to objects
        const calls = result.map(call => ({
            ...call,
            transcript: JSON.parse(call.transcript || '[]'),
            averageConfidence: call.average_confidence, // Map snake_case to camelCase
            phoneNumber: call.phone_number,
            createdAt: call.created_at
        }));

        res.json({
            success: true,
            data: calls
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
