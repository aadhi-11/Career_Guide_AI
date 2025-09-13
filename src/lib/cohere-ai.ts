import { CohereClient } from 'cohere-ai';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

class CohereAIService {
  private conversationHistory: Map<string, ChatMessage[]> = new Map();

  private getSystemPrompt(): string {
    return `You are a professional career guide. Respond with direct, concise advice using minimal words. Be authoritative yet approachable.

CRITICAL FORMATTING RULES:
1. Keep responses under 100 words
2. Be direct and to the point
3. Use bullet points for lists
4. ALWAYS end with a follow-up question
5. Add ONE blank line before the final question

Response format:
[Direct advice with bullet points if needed]

[Blank line]

[One follow-up question]

Example:
"Start with Python or JavaScript. Build 3 projects, create a GitHub portfolio, apply to 10 jobs daily.

What's your current skill level?"

Remember: Professional, concise, direct, always end with a question after a blank line.`;
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
      
      console.log(`Session ${sessionId}: Retrieved ${conversationHistory.length} total messages, using last ${lastFiveExchanges.length} for context`);

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
        max_tokens: 150, // Further reduced for very concise responses
        temperature: 0.7, // Lower for more focused, professional responses
        stop_sequences: ['User:', 'Assistant:', '\n\nUser:', '\n\nAssistant:'],
        k: 0, // Disable top-k sampling for more focused responses
        p: 0.85, // Slightly lower for more focused responses
      });

      const aiResponse = response.generations[0]?.text?.trim() || '';

      if (!aiResponse) {
        throw new Error('Empty response from Cohere');
      }

      console.log('Cohere response:', aiResponse.substring(0, 100) + '...');

      // Clean up and format the response
      let finalResponse = aiResponse
        .replace(/\n\s*\n/g, '\n\n') // Normalize to single blank lines
        .replace(/^\s+|\s+$/g, '') // Trim whitespace
        .replace(/\s+/g, ' '); // Normalize spaces

      // Ensure proper formatting with blank line before question
      if (!finalResponse.includes('\n\n')) {
        // If no blank line exists, add one before the last sentence/question
        const lastSentence = finalResponse.split('.').pop()?.trim();
        if (lastSentence && lastSentence.includes('?')) {
          const mainText = finalResponse.substring(0, finalResponse.lastIndexOf(lastSentence)).trim();
          finalResponse = `${mainText}\n\n${lastSentence}`;
        }
      }

      // Ensure the response ends with a question
      if (!finalResponse.endsWith('?') && !finalResponse.endsWith('!')) {
        if (!finalResponse.includes('?')) {
          // Add a professional follow-up question with proper spacing
          finalResponse += '\n\nWhat specific aspect would you like to explore?';
        } else {
          // If it has a question but doesn't end with one, ensure proper spacing
          if (!finalResponse.includes('\n\n')) {
            finalResponse += '\n\n';
          }
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
