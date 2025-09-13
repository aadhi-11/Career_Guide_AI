export interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messageCount: number;
}

export const mockSessions: ChatSession[] = [
  {
    id: "1",
    title: "Software Engineering Career Path",
    lastMessage: "What's the best way to transition into tech?",
    timestamp: new Date("2024-01-15T10:00:00"),
    messageCount: 10,
  },
  {
    id: "2", 
    title: "Resume Optimization for Tech Jobs",
    lastMessage: "How can I make my resume stand out?",
    timestamp: new Date("2024-01-14T14:30:00"),
    messageCount: 10,
  },
  {
    id: "3",
    title: "Interview Preparation Strategies", 
    lastMessage: "How should I prepare for technical interviews?",
    timestamp: new Date("2024-01-13T09:00:00"),
    messageCount: 10,
  },
  {
    id: "4",
    title: "Salary Negotiation Tips",
    lastMessage: "How do I negotiate a better salary offer?",
    timestamp: new Date("2024-01-12T16:00:00"),
    messageCount: 10,
  },
  {
    id: "5",
    title: "Career Growth and Promotion",
    lastMessage: "How can I advance to senior developer?",
    timestamp: new Date("2024-01-11T11:00:00"),
    messageCount: 10,
  },
];
