const { OpenAI } = require('openai');
const { Pinecone } = require('@pinecone-database/pinecone');
const { logger } = require('../utils/logger');

const openai = process.env.OPENAI_API_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

const pinecone = process.env.PINECONE_API_KEY
    ? new Pinecone({
        apiKey: process.env.PINECONE_API_KEY,
        environment: process.env.PINECONE_ENVIRONMENT
    })
    : null;

let pineconeIndex;

async function initializePinecone() {
    try {
        if (!pinecone) {
            logger.warn('⚠️ Pinecone API key missing - skipping initialization');
            return;
        }
        pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);
        logger.info('✅ Pinecone initialized');
    } catch (error) {
        logger.error('Failed to initialize Pinecone:', error);
        throw error;
    }
}

// Embed text using OpenAI
async function embedText(text) {
    try {
        if (!openai) {
            logger.warn('Mock: Returning zero embedding (OpenAI key missing)');
            return new Array(1536).fill(0);
        }
        const response = await openai.embeddings.create({
            model: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-ada-002',
            input: text
        });
        return response.data[0].embedding;
    } catch (error) {
        logger.error('Embedding error:', error);
        throw error;
    }
}

// Retrieve relevant documents from vector DB
async function retrieveRelevantDocuments(query, callContext = {}, topK = 5) {
    try {
        // Embed the query
        const queryEmbedding = await embedText(query);

        // Build metadata filter
        const filter = buildContextFilter(callContext);

        // Search Pinecone
        const results = await pineconeIndex.query({
            vector: queryEmbedding,
            topK,
            includeMetadata: true,
            filter
        });

        return results.matches.map(match => ({
            content: match.metadata.content,
            score: match.score,
            source: match.metadata
        }));
    } catch (error) {
        logger.error('Retrieval error:', error);
        throw error;
    }
}

function buildContextFilter(callContext) {
    const filter = {};

    if (callContext.propertyId) {
        filter.propertyId = callContext.propertyId;
    }

    if (callContext.intent) {
        if (callContext.intent === 'policy_question') {
            filter.documentType = { $in: ['policy', 'terms'] };
        } else if (callContext.intent === 'property_details') {
            filter.documentType = { $in: ['property', 'faq'] };
        }
    }

    return filter;
}

// Classify intent
async function classifyIntent(transcript) {
    try {
        if (!openai) {
            return { intent: 'support', entities: {}, confidence: 0.5 };
        }
        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            temperature: 0.1,
            messages: [
                {
                    role: 'system',
                    content: `You are an intent classifier for a property booking platform.

Classify customer queries into one of these intents:
- booking_inquiry
- property_details
- policy_question
- directions
- check_in_instructions
- complaint
- payment_inquiry
- support

Return JSON: {"intent": "...", "entities": {...}, "confidence": 0.0-1.0}`
                },
                {
                    role: 'user',
                    content: transcript
                }
            ]
        });

        return JSON.parse(response.choices[0].message.content);
    } catch (error) {
        logger.error('Intent classification error:', error);
        return { intent: 'support', entities: {}, confidence: 0.5 };
    }
}

// Generate response with RAG
async function generateResponse(query, retrievedDocs, callContext = {}) {
    try {
        if (!openai) {
            return {
                text: "I'm sorry, my AI connection is currently limited. Please contact our support team directly.",
                finishReason: 'mock'
            };
        }
        // Build context from retrieved documents
        const context = retrievedDocs.map((doc, idx) =>
            `[${idx + 1}] ${doc.content}`
        ).join('\n\n');

        const systemPrompt = `You are JustBack AI Assistant, a helpful voice assistant for a property booking platform in Nigeria.

CRITICAL RULES:
1. Answer ONLY using the provided context documents
2. If information is not in the context, say "I don't have that information. Let me connect you to our team."
3. Be conversational and friendly - you're speaking, not writing
4. Use Nigerian English naturally (e.g., "You can book this property for ₦45,000 per night")
5. Keep responses under 50 words - people don't like long voice responses
6. Always mention the property name and location for clarity
7. For prices, always state the currency (Naira)

ESCALATION TRIGGERS:
- Payment disputes
- Complaints about host/property
- Requests to modify existing booking
- Questions about refunds
- Any request requiring account access`;

        const response = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || 'gpt-4',
            temperature: 0.3,
            max_tokens: 150,
            messages: [
                {
                    role: 'system',
                    content: systemPrompt
                },
                {
                    role: 'user',
                    content: `Context:\n${context}\n\nCustomer Query: ${query}\n\nResponse (conversational, under 50 words):`
                }
            ]
        });

        return {
            text: response.choices[0].message.content,
            finishReason: response.choices[0].finish_reason
        };
    } catch (error) {
        logger.error('Response generation error:', error);
        throw error;
    }
}

// Generate with confidence scoring
async function generateWithConfidence(query, retrievedDocs) {
    const response = await generateResponse(query, retrievedDocs);

    // Calculate confidence score
    const avgRetrievalScore = retrievedDocs.length > 0
        ? retrievedDocs.reduce((sum, doc) => sum + doc.score, 0) / retrievedDocs.length
        : 0;

    // Penalize if response contains uncertainty phrases
    const uncertaintyPhrases = [
        "I don't have",
        "I'm not sure",
        "I don't know",
        "Let me connect you"
    ];

    const hasUncertainty = uncertaintyPhrases.some(phrase =>
        response.text.includes(phrase)
    );

    let confidence = avgRetrievalScore;

    if (hasUncertainty) {
        confidence *= 0.5;
    }

    if (avgRetrievalScore < 0.7) {
        confidence *= 0.7;
    }

    return {
        text: response.text,
        confidence: confidence,
        shouldEscalate: confidence < 0.85
    };
}

// Upsert document to vector DB
async function upsertDocument(id, text, metadata) {
    try {
        const embedding = await embedText(text);

        await pineconeIndex.upsert([{
            id,
            values: embedding,
            metadata: {
                ...metadata,
                content: text,
                lastUpdated: new Date().toISOString()
            }
        }]);

        logger.info(`Document ${id} upserted to vector DB`);
    } catch (error) {
        logger.error('Upsert error:', error);
        throw error;
    }
}

// Delete documents by filter
async function deleteDocuments(filter) {
    try {
        await pineconeIndex.deleteMany(filter);
        logger.info('Documents deleted from vector DB');
    } catch (error) {
        logger.error('Delete error:', error);
        throw error;
    }
}

module.exports = {
    initializePinecone,
    embedText,
    retrieveRelevantDocuments,
    classifyIntent,
    generateResponse,
    generateWithConfidence,
    upsertDocument,
    deleteDocuments
};
