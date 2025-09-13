import { z } from 'zod';
import { router, publicProcedure } from './trpc';
import { prisma } from './prisma';
import { mockSessions } from './dummy-data';

export const appRouter = router({
  // Reset sessions to only the 5 mock sessions (for development)
  resetSessions: publicProcedure.mutation(async () => {
    // Clear existing sessions
    await prisma.chatSession.deleteMany();
    
    // Create mock sessions
    for (const session of mockSessions) {
      await prisma.chatSession.create({
        data: {
          id: session.id,
          title: session.title,
          lastMessage: session.lastMessage,
          createdAt: session.timestamp,
          updatedAt: session.timestamp,
        },
      });
    }
    
    return { success: true };
  }),

  // Get all chat sessions
  getSessions: publicProcedure.query(async () => {
    const sessions = await prisma.chatSession.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    
    return sessions.map((session: any) => ({
      id: session.id,
      title: session.title,
      lastMessage: session.lastMessage || '',
      timestamp: session.updatedAt,
      messages: session.messages.map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        role: msg.role.toLowerCase() as 'user' | 'assistant',
        timestamp: msg.createdAt,
      })),
    }));
  }),

  // Get a specific session by ID
  getSession: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ input }) => {
      const session = await prisma.chatSession.findUnique({
        where: { id: input.sessionId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });
      
      if (!session) {
        throw new Error('Session not found');
      }
      
      return {
        id: session.id,
        title: session.title,
        lastMessage: session.lastMessage || '',
        timestamp: session.updatedAt,
        messages: session.messages.map((msg: any) => ({
          id: msg.id,
          content: msg.content,
          role: msg.role.toLowerCase() as 'user' | 'assistant',
          timestamp: msg.createdAt,
        })),
      };
    }),

  // Create a new chat session
  createSession: publicProcedure
    .input(z.object({ title: z.string().optional() }))
    .mutation(async ({ input }) => {
      const newSession = await prisma.chatSession.create({
        data: {
          title: input.title || "New Chat",
          lastMessage: "",
        },
      });
      
      return {
        id: newSession.id,
        title: newSession.title,
        lastMessage: newSession.lastMessage || '',
        timestamp: newSession.createdAt,
        messages: [],
      };
    }),

  // Update session title
  updateSessionTitle: publicProcedure
    .input(z.object({ 
      sessionId: z.string(),
      title: z.string()
    }))
    .mutation(async ({ input }) => {
      const updatedSession = await prisma.chatSession.update({
        where: { id: input.sessionId },
        data: { title: input.title },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });
      
      return {
        id: updatedSession.id,
        title: updatedSession.title,
        lastMessage: updatedSession.lastMessage || '',
        timestamp: updatedSession.updatedAt,
        messages: updatedSession.messages.map((msg: any) => ({
          id: msg.id,
          content: msg.content,
          role: msg.role.toLowerCase() as 'user' | 'assistant',
          timestamp: msg.createdAt,
        })),
      };
    }),

  // Add a message to a session
  addMessage: publicProcedure
    .input(z.object({
      sessionId: z.string(),
      content: z.string(),
      role: z.enum(['user', 'assistant'])
    }))
    .mutation(async ({ input }) => {
      // Create the message
      const newMessage = await prisma.message.create({
        data: {
          content: input.content,
          role: input.role.toUpperCase() as 'USER' | 'ASSISTANT',
          sessionId: input.sessionId,
        },
      });

      // Update session's last message and timestamp
      const updatedSession = await prisma.chatSession.update({
        where: { id: input.sessionId },
        data: { 
          lastMessage: input.content,
          updatedAt: new Date(),
        },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      return {
        id: updatedSession.id,
        title: updatedSession.title,
        lastMessage: updatedSession.lastMessage || '',
        timestamp: updatedSession.updatedAt,
        messages: updatedSession.messages.map((msg: any) => ({
          id: msg.id,
          content: msg.content,
          role: msg.role.toLowerCase() as 'user' | 'assistant',
          timestamp: msg.createdAt,
        })),
      };
    }),

  // Delete a session
  deleteSession: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ input }) => {
      await prisma.chatSession.delete({
        where: { id: input.sessionId },
      });
      
      return { success: true };
    }),
});

export type AppRouter = typeof appRouter;