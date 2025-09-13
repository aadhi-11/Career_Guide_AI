import { z } from 'zod';
import { router, publicProcedure } from './trpc';
import { mockSessions } from './dummy-data';

// Temporary in-memory storage for testing without database
let sessions: any[] = mockSessions.map(session => ({
  id: session.id,
  title: session.title,
  lastMessage: session.lastMessage,
  timestamp: session.timestamp,
  messages: session.messages || [],
}));

export const appRouterFallback = router({
  // Reset sessions to only the 5 mock sessions
  resetSessions: publicProcedure.mutation(() => {
    sessions = mockSessions.map(session => ({
      id: session.id,
      title: session.title,
      lastMessage: session.lastMessage,
      timestamp: session.timestamp,
      messages: session.messages || [],
    }));
    return { success: true };
  }),

  // Get all chat sessions
  getSessions: publicProcedure.query(() => {
    return sessions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }),

  // Get a specific session by ID
  getSession: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(({ input }) => {
      const session = sessions.find(s => s.id === input.sessionId);
      if (!session) {
        throw new Error('Session not found');
      }
      return session;
    }),

  // Create a new chat session
  createSession: publicProcedure
    .input(z.object({ title: z.string().optional() }))
    .mutation(({ input }) => {
      const newSession = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: input.title || "New Chat",
        lastMessage: "",
        timestamp: new Date(),
        messages: [],
      };
      
      sessions.unshift(newSession);
      return newSession;
    }),

  // Update session title
  updateSessionTitle: publicProcedure
    .input(z.object({ 
      sessionId: z.string(),
      title: z.string()
    }))
    .mutation(({ input }) => {
      const sessionIndex = sessions.findIndex(s => s.id === input.sessionId);
      if (sessionIndex === -1) {
        throw new Error('Session not found');
      }
      
      sessions[sessionIndex].title = input.title;
      return sessions[sessionIndex];
    }),

  // Add a message to a session
  addMessage: publicProcedure
    .input(z.object({
      sessionId: z.string(),
      content: z.string(),
      role: z.enum(['user', 'assistant'])
    }))
    .mutation(({ input }) => {
      const sessionIndex = sessions.findIndex(s => s.id === input.sessionId);
      if (sessionIndex === -1) {
        throw new Error('Session not found');
      }

      const newMessage = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        content: input.content,
        role: input.role,
        timestamp: new Date(),
      };

      sessions[sessionIndex].messages.push(newMessage);
      sessions[sessionIndex].lastMessage = input.content;
      sessions[sessionIndex].timestamp = new Date();

      return sessions[sessionIndex];
    }),

  // Delete a session
  deleteSession: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(({ input }) => {
      const sessionIndex = sessions.findIndex(s => s.id === input.sessionId);
      if (sessionIndex === -1) {
        throw new Error('Session not found');
      }
      
      sessions.splice(sessionIndex, 1);
      return { success: true };
    }),
});

export type AppRouter = typeof appRouterFallback;
