/**
 * AI Voice / RAG Pipeline Tests
 * Tests for AI voice call handling and RAG responses
 */

const request = require('supertest');
const express = require('express');

const app = express();
app.use(express.json());

// Mock data for RAG testing
const mockKnowledgeBase = [
    {
        id: 'kb-001',
        propertyId: 'prop-001',
        content: 'Check-in time is 2:00 PM. Check-out time is 12:00 PM noon.',
        category: 'policies'
    },
    {
        id: 'kb-002',
        propertyId: 'prop-001',
        content: 'Free parking is available for up to 2 vehicles. Street parking is also available.',
        category: 'amenities'
    },
    {
        id: 'kb-003',
        propertyId: 'prop-001',
        content: 'The property has 24/7 power supply with a backup generator.',
        category: 'utilities'
    },
    {
        id: 'kb-004',
        propertyId: 'prop-001',
        content: 'WiFi password will be provided upon check-in. Speed is 100 Mbps.',
        category: 'amenities'
    },
    {
        id: 'kb-005',
        propertyId: 'prop-001',
        content: 'Pool hours are 6 AM to 10 PM. Gym is open 24/7 for guests.',
        category: 'amenities'
    }
];

// Mock intent classification
const classifyIntent = (query) => {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('check-in') || lowerQuery.includes('check-out') || lowerQuery.includes('time')) {
        return { intent: 'policies', confidence: 0.95 };
    }
    if (lowerQuery.includes('parking') || lowerQuery.includes('car')) {
        return { intent: 'amenities', confidence: 0.92 };
    }
    if (lowerQuery.includes('power') || lowerQuery.includes('electricity') || lowerQuery.includes('generator')) {
        return { intent: 'utilities', confidence: 0.90 };
    }
    if (lowerQuery.includes('wifi') || lowerQuery.includes('internet')) {
        return { intent: 'amenities', confidence: 0.93 };
    }
    if (lowerQuery.includes('pool') || lowerQuery.includes('gym') || lowerQuery.includes('fitness')) {
        return { intent: 'amenities', confidence: 0.91 };
    }
    if (lowerQuery.includes('book') || lowerQuery.includes('reserve') || lowerQuery.includes('price')) {
        return { intent: 'booking', confidence: 0.88 };
    }

    return { intent: 'general', confidence: 0.5 };
};

// Mock document retrieval
const retrieveDocuments = (propertyId, intent) => {
    return mockKnowledgeBase.filter(doc =>
        doc.propertyId === propertyId &&
        (intent === 'general' || doc.category === intent)
    );
};

// Mock response generation (simulates OpenAI)
const generateResponse = (query, documents, propertyInfo) => {
    if (documents.length === 0) {
        return {
            response: "I apologize, but I don't have specific information about that. Would you like me to connect you with the host for more details?",
            confidence: 0.3,
            escalate: true
        };
    }

    const relevantContent = documents.map(d => d.content).join(' ');

    // Simple mock response generation
    return {
        response: relevantContent,
        confidence: 0.9,
        escalate: false,
        sources: documents.map(d => d.id)
    };
};

// Mock Twilio TwiML response
const generateTwiML = (speechText) => {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Aditi">${speechText}</Say>
    <Gather input="speech" timeout="5" action="/api/v1/voice/continue">
        <Say>Is there anything else I can help you with?</Say>
    </Gather>
</Response>`;
};

// Routes
app.post('/api/v1/voice/incoming', (req, res) => {
    // Simulate Twilio incoming call webhook
    const { CallSid, From, To } = req.body || {};

    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Aditi">Welcome to JustBack property assistance. How can I help you today?</Say>
    <Gather input="speech" timeout="5" action="/api/v1/voice/process">
        <Say>Please tell me your question after the beep.</Say>
    </Gather>
</Response>`;

    res.set('Content-Type', 'text/xml');
    res.send(twiml);
});

app.post('/api/v1/voice/process', (req, res) => {
    const { SpeechResult, propertyId = 'prop-001' } = req.body || {};

    if (!SpeechResult) {
        const twiml = generateTwiML("I didn't catch that. Could you please repeat your question?");
        res.set('Content-Type', 'text/xml');
        return res.send(twiml);
    }

    // RAG Pipeline
    const intentResult = classifyIntent(SpeechResult);
    const documents = retrieveDocuments(propertyId, intentResult.intent);
    const response = generateResponse(SpeechResult, documents, {});

    if (response.escalate) {
        const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Aditi">${response.response}</Say>
    <Dial>+2348000000000</Dial>
</Response>`;
        res.set('Content-Type', 'text/xml');
        return res.send(twiml);
    }

    const twiml = generateTwiML(response.response);
    res.set('Content-Type', 'text/xml');
    res.send(twiml);
});

app.post('/api/v1/voice/rag-query', (req, res) => {
    const { query, propertyId = 'prop-001' } = req.body;

    // Step 1: Classify intent
    const intentResult = classifyIntent(query);

    // Step 2: Retrieve relevant documents
    const documents = retrieveDocuments(propertyId, intentResult.intent);

    // Step 3: Generate response
    const response = generateResponse(query, documents, {});

    res.json({
        success: true,
        data: {
            query,
            intent: intentResult,
            documentsFound: documents.length,
            response: response.response,
            confidence: response.confidence,
            escalate: response.escalate,
            sources: response.sources || []
        }
    });
});

app.get('/api/v1/voice/call-logs', (req, res) => {
    res.json({
        success: true,
        data: {
            calls: [
                { id: 'call-001', status: 'completed', duration: 120, transcript: 'Asked about check-in time' },
                { id: 'call-002', status: 'completed', duration: 85, transcript: 'Asked about parking' },
                { id: 'call-003', status: 'missed', duration: 0, transcript: '' }
            ],
            totalCalls: 3,
            avgDuration: 68
        }
    });
});

// ============================================
// AI VOICE TEST SUITES
// ============================================

describe('AI Voice: Intent Classification', () => {
    it('should correctly classify check-in/check-out queries', () => {
        const result = classifyIntent('What time is check-in?');
        expect(result.intent).toBe('policies');
        expect(result.confidence).toBeGreaterThan(0.8);
    });

    it('should correctly classify parking queries', () => {
        const result = classifyIntent('Is there parking available?');
        expect(result.intent).toBe('amenities');
        expect(result.confidence).toBeGreaterThan(0.8);
    });

    it('should correctly classify power/utilities queries', () => {
        const result = classifyIntent('Does the property have a generator?');
        expect(result.intent).toBe('utilities');
        expect(result.confidence).toBeGreaterThan(0.8);
    });

    it('should correctly classify wifi queries', () => {
        const result = classifyIntent('What is the wifi speed?');
        expect(result.intent).toBe('amenities');
        expect(result.confidence).toBeGreaterThan(0.8);
    });

    it('should return general intent for unknown queries', () => {
        const result = classifyIntent('Tell me about the neighborhood');
        expect(result.intent).toBe('general');
        expect(result.confidence).toBeLessThan(0.8);
    });
});

describe('AI Voice: Document Retrieval', () => {
    it('should retrieve policy documents for policy intent', () => {
        const docs = retrieveDocuments('prop-001', 'policies');
        expect(docs.length).toBeGreaterThan(0);
        expect(docs[0].category).toBe('policies');
    });

    it('should retrieve amenity documents for amenity intent', () => {
        const docs = retrieveDocuments('prop-001', 'amenities');
        expect(docs.length).toBeGreaterThan(0);
        docs.forEach(doc => expect(doc.category).toBe('amenities'));
    });

    it('should return all documents for general intent', () => {
        const docs = retrieveDocuments('prop-001', 'general');
        expect(docs.length).toBe(5);
    });

    it('should return empty for non-existent property', () => {
        const docs = retrieveDocuments('prop-999', 'policies');
        expect(docs.length).toBe(0);
    });
});

describe('AI Voice: Response Generation', () => {
    it('should generate response with high confidence when documents found', () => {
        const docs = [{ id: 'kb-001', content: 'Check-in is at 2 PM' }];
        const response = generateResponse('What is check-in time?', docs, {});
        expect(response.confidence).toBeGreaterThan(0.8);
        expect(response.escalate).toBe(false);
    });

    it('should escalate when no documents found', () => {
        const response = generateResponse('Random question', [], {});
        expect(response.escalate).toBe(true);
        expect(response.confidence).toBeLessThan(0.5);
    });
});

describe('AI Voice: RAG API Endpoint', () => {
    it('should return correct response for check-in query', async () => {
        const res = await request(app)
            .post('/api/v1/voice/rag-query')
            .send({ query: 'What time is check-in?', propertyId: 'prop-001' });

        expect(res.status).toBe(200);
        expect(res.body.data.intent.intent).toBe('policies');
        expect(res.body.data.documentsFound).toBeGreaterThan(0);
        expect(res.body.data.response).toContain('2:00 PM');
    });

    it('should return correct response for parking query', async () => {
        const res = await request(app)
            .post('/api/v1/voice/rag-query')
            .send({ query: 'Is there parking available?', propertyId: 'prop-001' });

        expect(res.status).toBe(200);
        expect(res.body.data.intent.intent).toBe('amenities');
        expect(res.body.data.response).toContain('parking');
    });

    it('should return correct response for pool/gym query', async () => {
        const res = await request(app)
            .post('/api/v1/voice/rag-query')
            .send({ query: 'What are the pool hours?', propertyId: 'prop-001' });

        expect(res.status).toBe(200);
        expect(res.body.data.response).toContain('Pool hours');
    });
});

describe('AI Voice: Twilio Webhooks', () => {
    it('should return TwiML for incoming call', async () => {
        const res = await request(app)
            .post('/api/v1/voice/incoming')
            .send({ CallSid: 'test-123', From: '+2348012345678' });

        expect(res.status).toBe(200);
        expect(res.header['content-type']).toContain('text/xml');
        expect(res.text).toContain('<Response>');
        expect(res.text).toContain('Welcome to JustBack');
    });

    it('should process speech and return response', async () => {
        const res = await request(app)
            .post('/api/v1/voice/process')
            .send({ SpeechResult: 'What time is check-in?', propertyId: 'prop-001' });

        expect(res.status).toBe(200);
        expect(res.text).toContain('2:00 PM');
    });

    it('should handle missing speech result', async () => {
        const res = await request(app)
            .post('/api/v1/voice/process')
            .send({});

        expect(res.status).toBe(200);
        expect(res.text).toContain("didn't catch that");
    });
});

describe('AI Voice: Call Logs', () => {
    it('should return call logs', async () => {
        const res = await request(app)
            .get('/api/v1/voice/call-logs');

        expect(res.status).toBe(200);
        expect(res.body.data.calls.length).toBe(3);
        expect(res.body.data.totalCalls).toBe(3);
    });
});
