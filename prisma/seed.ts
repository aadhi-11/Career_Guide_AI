import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create fake user
  const fakeUser = await prisma.user.upsert({
    where: { email: 'demo@careerguide.com' },
    update: {},
    create: {
      id: 'user-demo-123',
      name: 'Demo User',
      email: 'demo@careerguide.com',
    },
  });

  console.log('✅ Fake user created:', fakeUser);

  // Create some sample chat sessions with messages
  const sampleSessions = [
    {
      id: 'session-1',
      userId: fakeUser.id,
      title: 'Career Transition to Tech',
      lastMessage: 'What programming language should I start with?',
      messages: [
        {
          id: 'msg-1-1',
          content: 'I want to transition to tech. What programming language should I start with?',
          role: 'USER' as const,
        },
        {
          id: 'msg-1-2',
          content: 'Start with Python or JavaScript. Both are beginner-friendly and have strong job markets.\n\nWhat\'s your current background?',
          role: 'ASSISTANT' as const,
        },
      ],
    },
    {
      id: 'session-2', 
      userId: fakeUser.id,
      title: 'Resume Building Tips',
      lastMessage: 'How can I make my resume stand out?',
      messages: [
        {
          id: 'msg-2-1',
          content: 'How can I make my resume stand out for tech jobs?',
          role: 'USER' as const,
        },
        {
          id: 'msg-2-2',
          content: 'Focus on quantifiable achievements, use action verbs, and include relevant projects.\n\nWhat type of tech role are you targeting?',
          role: 'ASSISTANT' as const,
        },
      ],
    },
  ];

  for (const session of sampleSessions) {
    const { messages, ...sessionData } = session;
    
    await prisma.chatSession.upsert({
      where: { id: sessionData.id },
      update: {},
      create: {
        ...sessionData,
        messages: {
          create: messages,
        },
      },
    });
  }

  console.log('✅ Sample sessions and messages created');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

