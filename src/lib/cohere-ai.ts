import { CohereClient } from 'cohere-ai';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

class CohereAIService {
  private conversationHistory: Map<string, ChatMessage[]> = new Map();

  private getSystemPrompt(): string {
    return `You are a friendly, experienced career mentor having a casual chat. Be brief, warm, and conversational like you're talking to a friend over coffee.

IMPORTANT: Every response MUST end with a question to keep the conversation flowing.

Your style:
- Keep responses short (2-3 sentences max)
- Use bullet points for lists when helpful
- Be encouraging and relatable
- Share quick, actionable tips
- Ask engaging follow-up questions
- Use casual, friendly language

Examples of good responses:
"Great question! Here are 3 quick steps to get started:
• Pick one programming language (I'd suggest Python or JavaScript)
• Build 2-3 small projects to practice
• Join online communities like GitHub

What type of projects interest you most?"

Remember: Be brief, friendly, and always end with a question!`;
  }

  private formatConversationHistory(history: ChatMessage[]): string {
    if (history.length === 0) return '';
    
    return history
      .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n\n');
  }

  private getLastFiveExchanges(history: ChatMessage[]): ChatMessage[] {
    // Get the last 10 messages (5 exchanges = 10 messages total)
    return history.slice(-10);
  }

  async generateResponse(
    userMessage: string,
    sessionId: string,
    conversationHistory: ChatMessage[] = [],
    apiKey?: string
  ): Promise<string> {
    try {
      const actualApiKey = apiKey || process.env.COHERE_API_KEY;
      if (!actualApiKey) {
        throw new Error('Cohere API key is not configured');
      }

      console.log('Using Cohere API key:', actualApiKey.substring(0, 10) + '...');

      const cohere = new CohereClient({
        token: actualApiKey,
      });

      // Get the last 5 exchanges for context
      const lastFiveExchanges = this.getLastFiveExchanges(conversationHistory);
      const contextHistory = this.formatConversationHistory(lastFiveExchanges);

      // Create the prompt with system instructions and context
      let prompt = this.getSystemPrompt();
      
      if (contextHistory) {
        prompt += `\n\nPrevious conversation context:\n${contextHistory}\n\n`;
      }

      prompt += `Current user message: ${userMessage}`;

      console.log('Sending prompt to Cohere:', prompt.substring(0, 200) + '...');

      // Generate response using Cohere
      const response = await cohere.generate({
        model: 'command',
        prompt: prompt,
        max_tokens: 300, // Reduced for more concise responses
        temperature: 0.8, // Slightly higher for more natural, friendly tone
        stop_sequences: ['User:', 'Assistant:', '\n\nUser:', '\n\nAssistant:'],
        k: 0, // Disable top-k sampling for more focused responses
        p: 0.9, // Use nucleus sampling for better quality
      });

      const aiResponse = response.generations[0]?.text?.trim() || '';

      if (!aiResponse) {
        throw new Error('Empty response from Cohere');
      }

      console.log('Cohere response:', aiResponse.substring(0, 100) + '...');

      // Clean up and format the response
      let finalResponse = aiResponse
        .replace(/\n\s*\n/g, '\n') // Remove extra line breaks
        .replace(/^\s+|\s+$/g, '') // Trim whitespace
        .replace(/\s+/g, ' '); // Normalize spaces

      // Ensure the response ends with a question
      if (!finalResponse.endsWith('?') && !finalResponse.endsWith('!')) {
        // Check if it already contains a question mark somewhere
        if (!finalResponse.includes('?')) {
          // Add a friendly follow-up question
          finalResponse += ' What would you like to know more about?';
        } else {
          // If it has a question but doesn't end with one, add a period
          finalResponse += '.';
        }
      }

      // Add the AI response to conversation history
      this.addToHistory(sessionId, userMessage, 'user');
      this.addToHistory(sessionId, finalResponse, 'assistant');

      return finalResponse;

    } catch (error) {
      console.error('Error generating Cohere response:', error);
      
      // Fallback response that always ends with a question
      const fallbackResponse = `I apologize, but I'm having trouble connecting to the AI service right now. However, I'd be happy to help you with your career questions! Could you tell me more about your current career situation and what specific guidance you're looking for?`;
      
      // Add fallback to history
      this.addToHistory(sessionId, userMessage, 'user');
      this.addToHistory(sessionId, fallbackResponse, 'assistant');
      
      return fallbackResponse;
    }
  }

  private addToHistory(sessionId: string, content: string, role: 'user' | 'assistant'): void {
    if (!this.conversationHistory.has(sessionId)) {
      this.conversationHistory.set(sessionId, []);
    }

    const history = this.conversationHistory.get(sessionId)!;
    history.push({
      role,
      content,
      timestamp: Date.now(),
    });

    // Keep only the last 20 messages per session to manage memory
    if (history.length > 20) {
      history.splice(0, history.length - 20);
    }
  }

  getSessionHistory(sessionId: string): ChatMessage[] {
    return this.conversationHistory.get(sessionId) || [];
  }

  clearSessionHistory(sessionId: string): void {
    this.conversationHistory.delete(sessionId);
  }
}

export const cohereAI = new CohereAIService();
