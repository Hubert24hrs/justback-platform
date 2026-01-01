const express = require('express');
const router = express.Router();
const { handleIncomingCall, processSpeech, handleCallEnded, requestAICall } = require('../ai-voice/twilio-handler');
const { authenticate } = require('../middleware/auth');

// Twilio webhooks (no auth needed - Twilio calls these)
router.post('/webhook/incoming-call', handleIncomingCall);
router.post('/process-speech', processSpeech);
router.post('/call-ended', handleCallEnded);

// Request AI callback (authenticated)
router.post('/request-call', authenticate, async (req, res, next) => {
    try {
        const { propertyId, callReason = 'inquiry' } = req.body;

        const result = await requestAICall(req.user.id, propertyId, callReason);

        res.json({
            success: true,
            data: result,
            message: 'AI assistant will call you shortly'
        });
    } catch (error) {
        next(error);
    }
});

// Get call logs (user sees only their calls)
router.get('/calls', authenticate, async (req, res, next) => {
    try {
        const CallLog = require('../models/CallLog');

        const calls = await CallLog.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(50);

        res.json({
            success: true,
            data: calls
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
