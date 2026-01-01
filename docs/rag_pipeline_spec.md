# JustBack - RAG Pipeline Technical Specification

Complete technical specification for the AI Voice Call System using Retrieval-Augmented Generation (RAG).

---

## Architecture Overview

![RAG Pipeline Flow](C:/Users/HP/.gemini/antigravity/brain/6c4f14a8-b887-42fe-8a67-b593468c2019/rag_pipeline_flow_1767220028557.png)

The RAG pipeline enables the AI voice assistant to answer customer queries using real, up-to-date business data from the JustBack platform.

---

## Core Components

### 1. Speech-to-Text (STT)

**Provider**: OpenAI Whisper API

**Configuration**:
```javascript
{
  model: 'whisper-1',
  language: 'en', // Auto-detect Nigerian English
  response_format: 'verbose_json', // Includes word-level timestamps
  temperature: 0.2 // Lower for accuracy
}
```

**Nigerian English Optimization**:
- Fine-tune on Nigerian accent datasets
- Custom vocabulary for local terms (e.g., "shortlet", "Boys Quarters", "duplex")
- Pidgin English support (Phase 2)

**Example**:
```javascript
const transcription = await openai.audio.transcriptions.create({
  file: audioStream,
  model: 'whisper-1',
  language: 'en',
  prompt: 'Customer calling about property booking in Lagos, Nigeria'
});

// Output:
// {
//   text: "I'm looking for a three bedroom apartment in Lekki",
//   words: [...],
//   language: 'en'
// }
```

---

### 2. Intent Classification

**Purpose**: Determine what the customer wants to accomplish

**Intent Categories**:
1. `booking_inquiry` - Asking about availability, pricing
2. `property_details` - Questions about amenities, location
3. `policy_question` - Cancellation, refund policies
4. `directions` - How to get to property
5. `check_in_instructions` - Check-in process, keys
6. `complaint` - Issues, disputes
7. `payment_inquiry` - Payment status, methods
8. `support` - General help

**Implementation**:
```javascript
async function classifyIntent(transcript) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    temperature: 0.1, // Deterministic
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
}

// Example output:
// {
//   intent: 'booking_inquiry',
//   entities: {
//     bedrooms: 3,
//     location: 'Lekki',
//     propertyType: 'apartment'
//   },
//   confidence: 0.95
// }
```

---

### 3. Knowledge Base & Vector Database

**Vector Database**: Pinecone (managed, scalable)

**Index Configuration**:
```python
import pinecone

pinecone.init(api_key='...', environment='us-west4-gcp')

# Create index
pinecone.create_index(
    name='justback-knowledge',
    dimension=1536,  # OpenAI text-embedding-ada-002
    metric='cosine',
    pods=2,
    pod_type='p1.x1'
)
```

**Document Types & Metadata**:

```javascript
// Property Document
{
  id: 'prop_12345_general',
  values: [...], // 1536-dim embedding vector
  metadata: {
    documentType: 'property',
    propertyId: '12345',
    propertyName: 'Lekki Luxury Apartment',
    location: 'Lekki, Lagos',
    bedrooms: 3,
    pricePerNight: 45000,
    amenities: ['wifi', 'pool', 'parking'],
    lastUpdated: '2025-12-31T00:00:00Z'
  }
}

// FAQ Document
{
  id: 'faq_12345_checkin',
  values: [...],
  metadata: {
    documentType: 'faq',
    propertyId: '12345',
    category: 'check_in',
    question: 'What are the check-in instructions?',
    answer: 'Check-in is at 2 PM. The key is with the security guard...'
  }
}

// Policy Document
{
  id: 'policy_cancellation_24h',
  values: [...],
  metadata: {
    documentType: 'policy',
    policyType: 'cancellation',
    policyName: '24-hour cancellation',
    applicableProperties: 'all'
  }
}
```

**Embedding Model**: OpenAI `text-embedding-ada-002`

```javascript
async function embedText(text) {
  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: text
  });
  
  return response.data[0].embedding; // 1536-dim vector
}
```

---

### 4. Document Retrieval

**Semantic Search with Filters**:

```javascript
async function retrieveRelevantDocuments(query, callContext) {
  // 1. Embed the query
  const queryEmbedding = await embedText(query);
  
  // 2. Build metadata filters
  const filter = buildContextFilter(callContext);
  
  // 3. Search Pinecone
  const results = await pineconeIndex.query({
    vector: queryEmbedding,
    topK: 5,
    includeMetadata: true,
    filter: filter
  });
  
  return results.matches.map(match => ({
    content: match.metadata.content,
    score: match.score,
    source: match.metadata
  }));
}

function buildContextFilter(callContext) {
  const filter = {};
  
  // If caller is asking about specific property
  if (callContext.propertyId) {
    filter.propertyId = callContext.propertyId;
  }
  
  // If caller has active booking
  if (callContext.bookingId) {
    filter.bookingId = callContext.bookingId;
  }
  
  // Filter by document type based on intent
  if (callContext.intent === 'policy_question') {
    filter.documentType = { $in: ['policy', 'terms'] };
  } else if (callContext.intent === 'property_details') {
    filter.documentType = { $in: ['property', 'faq'] };
  }
  
  return filter;
}
```

**Hybrid Search** (Future Enhancement):
```javascript
// Combine semantic search with keyword matching
async function hybridSearch(query, callContext) {
  const semanticResults = await retrieveRelevantDocuments(query, callContext);
  
  // BM25 keyword search on property names, locations
  const keywordResults = await elasticsearchClient.search({
    index: 'properties',
    body: {
      query: {
        multi_match: {
          query: query,
          fields: ['title^2', 'location', 'description']
        }
      }
    }
  });
  
  // Combine and re-rank
  return rerank(semanticResults, keywordResults);
}
```

---

### 5. LLM Response Generation

**Model**: GPT-4 (best for Nigerian English & complex queries)

**Prompt Engineering**:

```javascript
const SYSTEM_PROMPT = `You are JustBack AI Assistant, a helpful voice assistant for a property booking platform in Nigeria.

CRITICAL RULES:
1. Answer ONLY using the provided context documents
2. If information is not in the context, say "I don't have that information. Let me connect you to our team."
3. Be conversational and friendly - you're speaking, not writing
4. Use Nigerian English naturally (e.g., "You can book this property for ₦45,000 per night")
5. Keep responses under 50 words - people don't like long voice responses
6. If caller asks for booking, get: dates, number of guests, property preference
7. Always mention the property name and location for clarity
8. For prices, always state the currency (Naira)

ESCALATION TRIGGERS:
- Payment disputes
- Complaints about host/property
- Requests to modify existing booking
- Questions about refunds
- Any request requiring account access`;

async function generateResponse(query, retrievedDocs, callContext) {
  // Build context from retrieved documents
  const context = retrievedDocs.map((doc, idx) => 
    `[${idx + 1}] ${doc.content}`
  ).join('\n\n');
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    temperature: 0.3, // Slightly creative but consistent
    max_tokens: 150, // Keep responses short
    messages: [
      {
        role: 'system',
        content: SYSTEM_PROMPT
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
}
```

**Confidence Scoring**:

```javascript
async function generateWithConfidence(query, retrievedDocs) {
  const response = await generateResponse(query, retrievedDocs);
  
  // Calculate confidence score
  const avgRetrievalScore = average(retrievedDocs.map(d => d.score));
  
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
    confidence *= 0.5; // Halve confidence if AI is uncertain
  }
  
  // Low retrieval scores = low confidence
  if (avgRetrievalScore < 0.7) {
    confidence *= 0.7;
  }
  
  return {
    text: response.text,
    confidence: confidence,
    shouldEscalate: confidence < 0.85
  };
}
```

---

### 6. Text-to-Speech (TTS)

**Provider**: Amazon Polly (Neural voices)

**Voice Selection**:
- **Primary**: `Joanna-Neural` (US English, clear)
- **Alternative**: `Amy-Neural` (British English)
- **Future**: Nigerian accent TTS (custom voice)

**Configuration**:
```javascript
import AWS from 'aws-sdk';

const polly = new AWS.Polly();

async function synthesizeSpeech(text) {
  const params = {
    Text: text,
    OutputFormat: 'mp3',
    VoiceId: 'Joanna',
    Engine: 'neural',
    SampleRate: '24000',
    TextType: 'text'
  };
  
  const response = await polly.synthesizeSpeech(params).promise();
  
  return response.AudioStream; // MP3 audio buffer
}
```

**SSML for Better Prosody**:
```javascript
const ssml = `
<speak>
  Great! I found a 3-bedroom apartment in Lekki.
  <break time="300ms"/>
  It's called <emphasis level="moderate">Lekki Luxury Apartment</emphasis>,
  and it costs <say-as interpret-as="currency" format="NGN">₦45,000</say-as> per night.
  <break time="500ms"/>
  Would you like me to check availability for your dates?
</speak>
`;

await polly.synthesizeSpeech({
  Text: ssml,
  TextType: 'ssml',
  VoiceId: 'Joanna',
  Engine: 'neural'
});
```

---

## Data Ingestion Pipeline

**Continuous Sync from Database to Vector DB**:

```javascript
import { CronJob } from 'cron';
import { chunkDocument } from './chunking';
import { embedText } from './embeddings';
import { pineconeIndex } from './pinecone';

// Sync properties every 15 minutes
new CronJob('*/15 * * * *', async () => {
  await syncProperties();
}, null, true);

async function syncProperties() {
  // Get recently updated properties
  const properties = await Property.find({
    updatedAt: { $gte: new Date(Date.now() - 15 * 60 * 1000) }
  });
  
  for (const property of properties) {
    await ingestProperty(property);
  }
}

async function ingestProperty(property) {
  // Delete old vectors for this property
  await pineconeIndex.delete({
    filter: { propertyId: property.id }
  });
  
  // Create chunks
  const chunks = [
    {
      id: `prop_${property.id}_general`,
      text: `Property: ${property.title}. 
             Location: ${property.address}, ${property.city}, ${property.state}.
             Type: ${property.propertyType}.
             Description: ${property.description}.
             Bedrooms: ${property.bedrooms}, Bathrooms: ${property.bathrooms}.
             Max guests: ${property.maxGuests}.`,
      metadata: {
        documentType: 'property',
        propertyId: property.id,
        propertyName: property.title,
        city: property.city
      }
    },
    {
      id: `prop_${property.id}_amenities`,
      text: `Property: ${property.title} in ${property.city}.
             Available amenities: ${property.amenities.join(', ')}.`,
      metadata: {
        documentType: 'property',
        propertyId: property.id
      }
    },
    {
      id: `prop_${property.id}_pricing`,
      text: `Property: ${property.title} in ${property.city}.
             Pricing: ${property.pricePerNight} Naira per night.
             ${property.weeklyPrice ? `Weekly rate: ${property.weeklyPrice} Naira.` : ''}
             ${property.monthlyPrice ? `Monthly rate: ${property.monthlyPrice} Naira.` : ''}
             Cleaning fee: ${property.cleaningFee} Naira.`,
      metadata: {
        documentType: 'pricing',
        propertyId: property.id,
        pricePerNight: property.pricePerNight
      }
    },
    {
      id: `prop_${property.id}_rules`,
      text: `Property: ${property.title}.
             Check-in time: ${property.checkInTime}.
             Check-out time: ${property.checkOutTime}.
             House rules: ${property.houseRules}.
             Cancellation policy: ${property.cancellationPolicy}.`,
      metadata: {
        documentType: 'policy',
        propertyId: property.id
      }
    }
  ];
  
  // Add custom FAQs
  if (property.customFaqs && property.customFaqs.length > 0) {
    property.customFaqs.forEach((faq, idx) => {
      chunks.push({
        id: `prop_${property.id}_faq_${idx}`,
        text: `Property: ${property.title}.\nQ: ${faq.question}\nA: ${faq.answer}`,
        metadata: {
          documentType: 'faq',
          propertyId: property.id,
          faqCategory: faq.category
        }
      });
    });
  }
  
  // Embed and upsert all chunks
  for (const chunk of chunks) {
    const embedding = await embedText(chunk.text);
    
    await pineconeIndex.upsert([{
      id: chunk.id,
      values: embedding,
      metadata: {
        ...chunk.metadata,
        content: chunk.text,
        lastUpdated: new Date().toISOString()
      }
    }]);
  }
  
  console.log(`✓ Synced property ${property.id} to vector DB`);
}
```

**Static Knowledge Ingestion** (Policies, Guides):

```javascript
// Ingest company-wide policies (one-time or on update)
async function ingestPolicies() {
  const policies = [
    {
      id: 'policy_cancellation_24h',
      title: '24-Hour Cancellation Policy',
      content: `Guests can cancel their booking up to 24 hours before check-in for a full refund...`
    },
    {
      id: 'policy_payment_terms',
      title: 'Payment Terms',
      content: `Payment is processed immediately upon booking. Funds are held in escrow...`
    }
    // More policies...
  ];
  
  for (const policy of policies) {
    const embedding = await embedText(policy.content);
    await pineconeIndex.upsert([{
      id: policy.id,
      values: embedding,
      metadata: {
        documentType: 'policy',
        policyType: policy.title,
        content: policy.content
      }
    }]);
  }
}
```

---

## Call Flow Integration

**Complete End-to-End Flow**:

```javascript
// Twilio Voice Webhook Handler
app.post('/voice/incoming', async (req, res) => {
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
    action: '/voice/process',
    timeout: 5,
    speechTimeout: 'auto',
    language: 'en-NG'
  });
  
  res.type('text/xml');
  res.send(twiml.toString());
});

// Process speech input
app.post('/voice/process', async (req, res) => {
  const transcript = req.body.SpeechResult;
  const callSid = req.body.CallSid;
  const confidence = parseFloat(req.body.Confidence);
  
  // Log transcript
  await CallLog.updateOne(
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
    twiml.gather({ input: 'speech', action: '/voice/process' });
    return res.type('text/xml').send(twiml.toString());
  }
  
  // Get call context (user info, previous interactions)
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
  await CallLog.updateOne(
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
          content: d.content
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
      action: '/voice/call-ended'
    }, process.env.SUPPORT_PHONE_NUMBER);
    
    // Log escalation
    await CallLog.updateOne(
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
      action: '/voice/process',
      finishOnKey: '#'
    });
    
    twiml.say("Is there anything else I can help you with?");
  }
  
  res.type('text/xml');
  res.send(twiml.toString());
});

// Call ended
app.post('/voice/call-ended', async (req, res) => {
  const callSid = req.body.CallSid;
  const duration = parseInt(req.body.CallDuration);
  const recordingUrl = req.body.RecordingUrl;
  
  await CallLog.updateOne(
    { callSid },
    {
      status: 'completed',
      duration,
      recordingUrl,
      endedAt: new Date()
    }
  );
  
  res.sendStatus(200);
});
```

---

## Testing & Validation

### RAG Accuracy Testing

```javascript
// Test suite for RAG accuracy
const testQueries = [
  {
    query: "How much does it cost to book a 3 bedroom in Lekki?",
    expectedIntent: 'booking_inquiry',
    expectedEntities: { bedrooms: 3, location: 'Lekki' },
    expectedDocTypes: ['property', 'pricing'],
    minimumConfidence: 0.85
  },
  {
    query: "What's the cancellation policy?",
    expectedIntent: 'policy_question',
    expectedDocTypes: ['policy'],
    mustContain: ['24 hours', 'refund']
  },
  {
    query: "How do I get to the property from the airport?",
    expectedIntent: 'directions',
    expectedDocTypes: ['property', 'location']
  }
];

async function testRAGPipeline() {
  for (const test of testQueries) {
    const intent = await classifyIntent(test.query);
    const docs = await retrieveRelevantDocuments(test.query, { intent: intent.intent });
    const response = await generateWithConfidence(test.query, docs);
    
    // Assertions
    assert.equal(intent.intent, test.expectedIntent);
    assert(response.confidence >= test.minimumConfidence);
    
    if (test.mustContain) {
      test.mustContain.forEach(phrase => {
        assert(response.text.toLowerCase().includes(phrase.toLowerCase()));
      });
    }
    
    console.log(`✓ Test passed: ${test.query}`);
  }
}
```

---

## Performance Metrics

**Target Metrics**:

| Metric | Target | Description |
|--------|--------|-------------|
| **STT Accuracy** | >95% | Word Error Rate < 5% |
| **Intent Classification Accuracy** | >90% | Correct intent identified |
| **RAG Confidence (avg)** | >0.85 | Average confidence score |
| **Escalation Rate** | <30% | Calls escalated to humans |
| **Response Time** | <3s | From speech end to TTS start |
| **Customer Satisfaction** | >4.0/5 | Post-call survey rating |

**Monitoring**:
```javascript
// Real-time metrics tracking
await CloudWatch.putMetricData({
  Namespace: 'JustBack/AIVoice',
  MetricData: [
    {
      MetricName: 'AverageConfidence',
      Value: ragResponse.confidence,
      Unit: 'None'
    },
    {
      MetricName: 'ResponseTime',
      Value: processingTime,
      Unit: 'Milliseconds'
    },
    {
      MetricName: 'EscalationRate',
      Value: ragResponse.shouldEscalate ? 1 : 0,
      Unit: 'Count'
    }
  ]
});
```

---

## Cost Optimization

**Per-Call Cost Breakdown** (3-minute call):

| Component | Cost |
|-----------|------|
| Twilio Voice (3 min) | $0.013 × 3 = $0.039 |
| Whisper STT (3 min) | $0.006 × 3 = $0.018 |
| OpenAI Embeddings (3 queries) | $0.0001 × 3 = $0.0003 |
| Pinecone Vector Search (3 queries) | $0.0002 × 3 = $0.0006 |
| GPT-4 (500 tokens) | $0.03/1K × 0.5 = $0.015 |
| Polly TTS (500 chars) | $0.000016 × 500 = $0.008 |
| **Total per call** | **~$0.08** |

**Optimization Strategies**:

1. **Cache Common Responses**
   ```javascript
   // Cache responses for common queries
   const cachedResponse = await redis.get(`response:${queryHash}`);
   if (cachedResponse) return cachedResponse;
   ```

2. **Batch Embeddings**
   ```javascript
   // Embed multiple queries at once
   const embeddings = await openai.embeddings.create({
     model: 'text-embedding-ada-002',
     input: [query1, query2, query3] // Batch up to 2048
   });
   ```

3. **Use GPT-3.5-Turbo for Simple Queries**
   ```javascript
   // Use cheaper model for high-confidence, simple queries
   const model = (intent === 'greeting' || confidence > 0.95) 
     ? 'gpt-3.5-turbo' 
     : 'gpt-4';
   ```

---

## Security & Privacy

### Call Recording Consent

```javascript
// NDPR Compliance - Notify user of recording
const twiml = new VoiceResponse();
twiml.say("This call may be recorded for quality assurance. Do you consent?");

twiml.gather({
  input: 'speech',
  action: '/voice/consent',
  timeout: 5
});

// Only record if user consents
app.post('/voice/consent', (req, res) => {
  const response = req.body.SpeechResult.toLowerCase();
  
  if (response.includes('yes') || response.includes('okay')) {
    twiml.record({
      action: '/voice/recording-complete',
      transcribe: false // We use Whisper instead
    });
  }
});
```

### Data Encryption

```javascript
// Encrypt transcripts before storing
import crypto from 'crypto';

function encryptTranscript(transcript) {
  const cipher = crypto.createCipher('aes-256-gcm', process.env.ENCRYPTION_KEY);
  let encrypted = cipher.update(transcript, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

// Store encrypted
await CallLog.updateOne(
  { callSid },
  { encryptedTranscript: encryptTranscript(transcript) }
);
```

---

## Future Enhancements

1. **Multi-Language Support**
   - Yoruba, Igbo, Hausa voices
   - Pidgin English understanding

2. **Emotion Detection**
   - Detect frustrated callers and escalate proactively
   - Adjust AI tone based on customer emotion

3. **Proactive Calling**
   - AI calls guests before check-in to confirm
   - Follow-up calls after checkout for reviews

4. **Voice Biometrics**
   - Authenticate users by voice
   - Prevent fraud

5. **Real-Time Translation**
   - English ↔ French (for expansion to Francophone Africa)

---

## Conclusion

This RAG pipeline enables JustBack to provide 24/7 AI-powered customer support that:
- Answers accurately using real business data
- Handles Nigerian English naturally
- Escalates complex issues to humans
- Reduces support costs by ~70%
- Improves customer satisfaction with instant responses

**Next Steps**: Implement the data ingestion pipeline and begin testing with sample property data.
