const twilio = require('twilio');
const { VoiceResponse } = twilio.twiml;
const { classifyIntent, retrieveRelevantDocuments, generateWithConfidence } = require('./rag-pipeline');
const CallLog = require('../models/CallLog');
const { logger } = require('../utils/logger');

const client = (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN)
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

// Handle incoming call
async function handleIncomingCall(req, res) {
    try {
        const twiml = new VoiceResponse();
        const callSid = req.body.CallSid;
        const fromNumber = req.body.From;

        // Create call log
        await CallLog.create({
            callSid,
            phoneNumber: fromNumber,
            direction: 'inbound',
            status: 'initiated'
        });

        // Greeting
        twiml.say({
            voice: 'Polly.Joanna-Neural',
            language: 'en-US'
        }, 'Hello! Welcome to JustBack. I\'m your AI assistant. How can I help you today?');

        // Gather speech
        twiml.gather({
            input: 'speech',
            action: '/api/v1/ai-voice/process-speech',
            timeout: 5,
            speechTimeout: 'auto',
            language: 'en-NG'
        });

        res.type('text/xml');
        res.send(twiml.toString());
    } catch (error) {
        logger.error('Incoming call error:', error);
        res.status(500).send('Error processing call');
    }
}

// Process speech input
async function processSpeech(req, res) {
    try {
        const transcript = req.body.SpeechResult;
        const callSid = req.body.CallSid;
        const confidence = parseFloat(req.body.Confidence);

        logger.info(`Call ${callSid}: "${transcript}" (confidence: ${confidence})`);

        // Log transcript
        await CallLog.findOneAndUpdate(
            { callSid },
            {
                $push: {
                    transcript: {
                        speaker: 'customer',
                        text: transcript,
                        timestamp: new Date(),
                        confidence
                    }
                }
            }
        );

        // Low STT confidence? Ask to repeat
        if (confidence < 0.6) {
            const twiml = new VoiceResponse();
            twiml.say("Sorry, I didn't catch that. Could you please repeat?");
            twiml.gather({
                input: 'speech',
                action: '/api/v1/ai-voice/process-speech',
                language: 'en-NG'
            });
            return res.type('text/xml').send(twiml.toString());
        }

        // Get call context
        const callContext = await getCallContext(callSid);

        // --- RAG PIPELINE ---

        // 1. Classify intent
        const { intent, entities } = await classifyIntent(transcript);
        callContext.intent = intent;
        callContext.entities = entities;

        // 2. Retrieve relevant documents
        const docs = await retrieveRelevantDocuments(transcript, callContext);

        // 3. Generate response with confidence
        const ragResponse = await generateWithConfidence(transcript, docs);

        // Log AI response
        await CallLog.findOneAndUpdate(
            { callSid },
            {
                $push: {
                    transcript: {
                        speaker: 'ai',
                        text: ragResponse.text,
                        timestamp: new Date(),
                        confidence: ragResponse.confidence
                    }
                },
                $set: {
                    retrievedDocuments: docs.map(d => ({
                        documentId: d.source.id,
                        relevanceScore: d.score,
                        content: d.content.substring(0, 200)
                    })),
                    averageConfidence: ragResponse.confidence
                }
            }
        );

        const twiml = new VoiceResponse();

        // --- ESCALATION LOGIC ---
        if (ragResponse.shouldEscalate || intent === 'complaint') {
            twiml.say("I understand. Let me connect you with one of our team members who can help you better.");

            // Transfer to human agent
            twiml.dial({
                action: '/api/v1/ai-voice/call-ended'
            }, process.env.SUPPORT_PHONE_NUMBER);

            // Log escalation
            await CallLog.findOneAndUpdate(
                { callSid },
                {
                    escalatedToHuman: true,
                    escalationReason: ragResponse.shouldEscalate ? 'Low confidence' : 'Complaint',
                    resolvedByAI: false
                }
            );
        } else {
            // AI handles the call
            twiml.say({
                voice: 'Polly.Joanna-Neural'
            }, ragResponse.text);

            // Continue conversation
            twiml.gather({
                input: 'speech',
                action: '/api/v1/ai-voice/process-speech',
                finishOnKey: '#',
                language: 'en-NG'
            });

            twiml.say("Is there anything else I can help you with?");
        }

        res.type('text/xml');
        res.send(twiml.toString());
    } catch (error) {
        logger.error('Speech processing error:', error);
        const twiml = new VoiceResponse();
        twiml.say("I'm sorry, I'm having trouble processing your request. Please try calling again.");
        res.type('text/xml').send(twiml.toString());
    }
}

// Call ended callback
async function handleCallEnded(req, res) {
    try {
        const callSid = req.body.CallSid;
        const duration = parseInt(req.body.CallDuration);
        const recordingUrl = req.body.RecordingUrl;

        await CallLog.findOneAndUpdate(
            { callSid },
            {
                status: 'completed',
                duration,
                recordingUrl,
                endedAt: new Date()
            }
        );

        logger.info(`Call ${callSid} ended. Duration: ${duration}s`);

        res.sendStatus(200);
    } catch (error) {
        logger.error('Call ended error:', error);
        res.sendStatus(200); // Still return 200 to Twilio
    }
}

// Get call context (user info, previous interactions)
async function getCallContext(callSid) {
    const callLog = await CallLog.findOne({ callSid });

    return {
        callSid,
        phoneNumber: callLog?.phoneNumber,
        previousInteractions: callLog?.transcript || []
    };
}

// Request AI callback
async function requestAICall(userId, propertyId, callReason) {
    try {
        // Get user's phone number
        const user = await query('SELECT phone FROM users WHERE id = $1', [userId]);

        if (!user.rows[0]?.phone) {
            throw new Error('User phone number not found');
        }

        // Initiate outbound call
        if (!client) {
            logger.warn('Mock: Twilio client missing, skipping real call');
            return {
                callSid: 'mock-call-' + Date.now(),
                estimatedWaitTime: '30 seconds (MOCK)'
            };
        }
        const call = await client.calls.create({
            to: user.rows[0].phone,
            from: process.env.TWILIO_PHONE_NUMBER,
            url: `${process.env.API_URL}/api/v1/ai-voice/webhook/outbound?propertyId=${propertyId}&reason=${callReason}`
        });

        logger.info(`Outbound call initiated: ${call.sid}`);

        return {
            callSid: call.sid,
            estimatedWaitTime: '30 seconds'
        };
    } catch (error) {
        logger.error('Request AI call error:', error);
        throw error;
    }
}

module.exports = {
    handleIncomingCall,
    processSpeech,
    handleCallEnded,
    requestAICall
};
