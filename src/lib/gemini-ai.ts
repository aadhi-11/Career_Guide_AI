import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export class GeminiAIService {
  private static instance: GeminiAIService;
  private conversationHistory: Map<string, ChatMessage[]> = new Map();

  static getInstance(): GeminiAIService {
    if (!GeminiAIService.instance) {
      GeminiAIService.instance = new GeminiAIService();
    }
    return GeminiAIService.instance;
  }

  private getSystemPrompt(): string {
    return `You are an expert career guidance AI assistant specializing in helping people with their professional development, career transitions, and job search strategies. 

Your role is to provide:
- Personalized career advice based on individual situations
- Industry insights and trends
- Resume and interview preparation tips
- Salary negotiation strategies
- Skill development recommendations
- Networking and job search guidance

IMPORTANT GUIDELINES:
1. Always end your response with a thoughtful question to encourage continued conversation
2. Be encouraging, professional, and supportive
3. Provide actionable, specific advice
4. Ask follow-up questions to better understand the user's situation
5. Keep responses conversational but informative
6. If you need more context, ask clarifying questions

Remember: Your goal is to be a helpful career mentor that guides users through their professional journey.`;
  }

  private formatConversationHistory(messages: ChatMessage[]): string {
    return messages
      .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n\n');
  }

  private getLastFiveExchanges(messages: ChatMessage[]): ChatMessage[] {
    // Get exactly the last 5 exchanges (10 messages: 5 user + 5 assistant)
    // This ensures we send maximum 5 previous exchanges for context
    return messages.slice(-10);
  }

  async generateResponse(
    userMessage: string, 
    sessionId: string, 
    conversationHistory: ChatMessage[] = [],
    apiKey?: string
  ): Promise<string> {
    try {
      // Use provided API key or fallback to environment
      const actualApiKey = apiKey || process.env.GEMINI_API_KEY;
      
      if (!actualApiKey) {
        throw new Error('Gemini API key is not configured');
      }
      
      // Create new instance with the API key
      const genAI = new GoogleGenerativeAI(actualApiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      // Update conversation history
      const currentHistory = this.conversationHistory.get(sessionId) || [];
      const updatedHistory = [...currentHistory, {
        role: 'user' as const,
        content: userMessage,
        timestamp: new Date()
      }];

      // Get last 5 exchanges for context
      const contextMessages = this.getLastFiveExchanges(updatedHistory);
      const contextString = this.formatConversationHistory(contextMessages);

      // Create the prompt with system message and context
      const prompt = `${this.getSystemPrompt()}

CONVERSATION CONTEXT (Last 5 exchanges):
${contextString}

Current User Message: ${userMessage}

Please provide a helpful career guidance response that ends with a question to continue the conversation.`;

      console.log('Sending prompt to Gemini:', prompt.substring(0, 200) + '...');
      
      const result = await model.generateContent(prompt);
      const aiResponse = result.response.text();
      
      console.log('Gemini response received:', aiResponse.substring(0, 100) + '...');

      // Add AI response to history
      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };

      updatedHistory.push(aiMessage);
      this.conversationHistory.set(sessionId, updatedHistory);

      return aiResponse;
    } catch (error) {
      console.error('Error generating Gemini response:', error);
      
      // Fallback response if Gemini fails
      const fallbackResponse = `I apologize, but I'm having trouble connecting to the AI service right now. However, I'd be happy to help you with your career questions! 

Could you tell me more about your current career situation and what specific guidance you're looking for?`;
      
      return fallbackResponse;
    }
  }

  // Clear conversation history for a session
  clearSessionHistory(sessionId: string): void {
    this.conversationHistory.delete(sessionId);
  }

  // Get conversation history for a session
  getSessionHistory(sessionId: string): ChatMessage[] {
    return this.conversationHistory.get(sessionId) || [];
  }
}

export const geminiAI = GeminiAIService.getInstance();
