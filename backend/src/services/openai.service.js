/**
 * OpenAI RAG Service for JustBack
 * 
 * Provides real AI-powered responses using OpenAI GPT
 * with property context from the database.
 */

const OpenAI = require('openai');

class OpenAIService {
    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY || ''
        });
        this.model = 'gpt-3.5-turbo';
    }

    /**
     * Get property context for RAG
     */
    buildPropertyContext(property) {
        if (!property) return '';

        return `
Property Information:
- Name: ${property.title}
- Location: ${property.address}, ${property.city}, ${property.state}
- Category: ${property.category}
- Price: ₦${property.pricePerNight?.toLocaleString()} per night
- Bedrooms: ${property.bedrooms}
- Bathrooms: ${property.bathrooms}
- Max Guests: ${property.maxGuests}
- Rating: ${property.rating}/5 stars
- Amenities: ${property.amenities?.join(', ') || 'Standard amenities'}
- Check-in: ${property.checkInTime || '2:00 PM'}
- Check-out: ${property.checkOutTime || '11:00 AM'}
- Description: ${property.description}
- Cancellation Policy: ${property.cancellationPolicy || 'Flexible - Free cancellation up to 24 hours before check-in'}
${property.houseRules ? `- House Rules: ${property.houseRules}` : ''}
    `.trim();
    }

    /**
     * Classify user intent
     */
    async classifyIntent(userMessage) {
        const intents = [
            'booking_inquiry',
            'pricing_question',
            'amenities_question',
            'location_question',
            'availability_check',
            'cancellation_policy',
            'check_in_out',
            'general_question',
            'complaint',
            'booking_modification'
        ];

        try {
            const response = await this.openai.chat.completions.create({
                model: this.model,
                messages: [
                    {
                        role: 'system',
                        content: `You are an intent classifier. Classify the user message into one of these intents: ${intents.join(', ')}. 
            Respond with ONLY the intent name, nothing else.`
                    },
                    { role: 'user', content: userMessage }
                ],
                max_tokens: 20,
                temperature: 0
            });

            const intent = response.choices[0]?.message?.content?.trim().toLowerCase();
            return intents.includes(intent) ? intent : 'general_question';
        } catch (error) {
            console.error('Intent classification error:', error.message);
            return 'general_question';
        }
    }

    /**
     * Generate AI response using RAG
     */
    async generateResponse(userMessage, property, conversationHistory = []) {
        const propertyContext = this.buildPropertyContext(property);

        const systemPrompt = `You are a helpful AI assistant for "I Just Got Back" - a premium Nigerian property booking platform. 
You help guests with questions about properties, bookings, and travel in Nigeria.

${propertyContext ? `PROPERTY CONTEXT:\n${propertyContext}\n` : ''}

GUIDELINES:
- Be friendly, professional, and helpful
- Use Nigerian Naira (₦) for prices
- If you don't know something specific, suggest contacting the host directly
- Keep responses concise but informative
- If asked about availability, suggest checking the booking calendar or contacting the host
- Mention check-in time is typically 2 PM and check-out is 11 AM unless otherwise stated
- For cancellation questions, mention the flexible policy with 24-hour free cancellation

Always be warm and welcoming, reflecting Nigerian hospitality!`;

        try {
            const messages = [
                { role: 'system', content: systemPrompt },
                ...conversationHistory.slice(-6), // Keep last 6 messages for context
                { role: 'user', content: userMessage }
            ];

            const response = await this.openai.chat.completions.create({
                model: this.model,
                messages,
                max_tokens: 500,
                temperature: 0.7
            });

            return {
                success: true,
                response: response.choices[0]?.message?.content || 'I apologize, I couldn\'t process that request. Please try again.',
                intent: await this.classifyIntent(userMessage),
                tokens: response.usage
            };
        } catch (error) {
            console.error('OpenAI response error:', error.message);

            // Return fallback response if API fails
            return {
                success: false,
                response: this.getFallbackResponse(userMessage, property),
                intent: 'fallback',
                error: error.message
            };
        }
    }

    /**
     * Fallback responses when API is unavailable
     */
    getFallbackResponse(userMessage, property) {
        const lowerMessage = userMessage.toLowerCase();

        if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('how much')) {
            return property
                ? `The ${property.title} costs ₦${property.pricePerNight?.toLocaleString()} per night. Would you like to check availability?`
                : 'Our properties range from ₦25,000 to ₦500,000 per night. Which location are you interested in?';
        }

        if (lowerMessage.includes('check-in') || lowerMessage.includes('check in')) {
            return 'Standard check-in time is 2:00 PM. Early check-in may be available upon request - please contact the host.';
        }

        if (lowerMessage.includes('check-out') || lowerMessage.includes('check out')) {
            return 'Standard check-out time is 11:00 AM. Late check-out may be available upon request.';
        }

        if (lowerMessage.includes('cancel')) {
            return 'We offer a flexible cancellation policy. You can cancel for free up to 24 hours before check-in for a full refund.';
        }

        if (lowerMessage.includes('wifi') || lowerMessage.includes('internet')) {
            return 'All our properties come with high-speed WiFi included at no extra charge.';
        }

        if (lowerMessage.includes('pool') || lowerMessage.includes('gym') || lowerMessage.includes('amenities')) {
            return property?.amenities
                ? `This property features: ${property.amenities.join(', ')}. Is there a specific amenity you're looking for?`
                : 'Our properties offer various amenities including WiFi, AC, and more. Would you like me to find properties with specific amenities?';
        }

        return 'Thank you for reaching out! I\'m your JustBack AI assistant. How can I help you with your property inquiry today?';
    }

    /**
     * Generate TwiML for voice calls
     */
    generateTwiML(message) {
        return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="en-GB">${message}</Say>
</Response>`;
    }

    /**
     * Summarize a conversation for logs
     */
    async summarizeConversation(messages) {
        if (!messages || messages.length === 0) return 'No conversation data';

        try {
            const response = await this.openai.chat.completions.create({
                model: this.model,
                messages: [
                    {
                        role: 'system',
                        content: 'Summarize the following conversation in 2-3 sentences for a call log.'
                    },
                    {
                        role: 'user',
                        content: messages.map(m => `${m.role}: ${m.content}`).join('\n')
                    }
                ],
                max_tokens: 100,
                temperature: 0.3
            });

            return response.choices[0]?.message?.content || 'Conversation summary unavailable';
        } catch (error) {
            return 'AI property inquiry session';
        }
    }
}

module.exports = new OpenAIService();
