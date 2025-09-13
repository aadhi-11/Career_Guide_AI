import { z } from 'zod';
import { router, publicProcedure } from './trpc';
import { prisma } from './prisma';
import { mockSessions } from './dummy-data';

export const appRouter = router({
  // Reset sessions to only the 5 mock sessions (for development)
  resetSessions: publicProcedure.mutation(async () => {
    // Clear existing sessions and messages
    await prisma.message.deleteMany();
    await prisma.chatSession.deleteMany();
    await prisma.user.deleteMany(); // Clear users too

    // Create a fake user for seeding
    const fakeUser = await prisma.user.upsert({
      where: { email: 'demo@careerguide.com' },
      update: {},
      create: {
        id: 'user-demo-123',
        name: 'Demo User',
        email: 'demo@careerguide.com',
      },
    });

    // Create mock sessions linked to the fake user
    for (const session of mockSessions) {
      await prisma.chatSession.create({
        data: {
          id: session.id,
          title: session.title,
          lastMessage: session.lastMessage,
          createdAt: session.timestamp,
          updatedAt: session.timestamp,
          userId: fakeUser.id, // Link to the fake user
          messages: {
            create: session.messages.map(msg => ({
              id: msg.id,
              content: msg.content,
              role: msg.role.toUpperCase() as 'USER' | 'ASSISTANT',
              createdAt: msg.timestamp,
              updatedAt: msg.timestamp,
            })),
          },
        },
      });
    }
    
    return { success: true };
  }),

  // Get chat sessions with pagination
  getSessions: publicProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(50).default(7),
    }).optional())
    .query(async ({ input }) => {
      const { page = 1, limit = 7 } = input || {};
      const skip = (page - 1) * limit;

      // Get total count for pagination info
      const totalCount = await prisma.chatSession.count();
      
      // Get paginated sessions
      const sessions = await prisma.chatSession.findMany({
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });
      
      const totalPages = Math.ceil(totalCount / limit);
      
      return {
        sessions: sessions.map((session: any) => ({
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
        })),
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      };
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
        throw new Error(`Session with ID ${input.sessionId} not found`);
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
      // Get or create the demo user
      const fakeUser = await prisma.user.upsert({
        where: { email: 'demo@careerguide.com' },
        update: {},
        create: {
          id: 'user-demo-123',
          name: 'Demo User',
          email: 'demo@careerguide.com',
        },
      });

      const newSession = await prisma.chatSession.create({
        data: {
          title: input.title || "New Chat",
          lastMessage: "",
          userId: fakeUser.id, // Link to the fake user
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
          chatSessionId: input.sessionId,
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