export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messages: Message[];
}

export const mockSessions: ChatSession[] = [
  {
    id: "1",
    title: "Software Engineering Career Path",
    lastMessage: "What's the best way to transition into tech?",
    timestamp: new Date("2024-01-15"),
    messages: [
      {
        id: "1-1",
        content: "I'm currently working in marketing but want to transition into software engineering. What's the best way to start?",
        role: "user",
        timestamp: new Date("2024-01-15T10:00:00"),
      },
      {
        id: "1-2",
        content: "Great question! Here's a structured approach to transition into software engineering:\n\n1. **Learn Fundamentals**: Start with HTML, CSS, and JavaScript for web development\n2. **Choose a Path**: Frontend (React/Vue), Backend (Node.js/Python), or Full-stack\n3. **Build Projects**: Create a portfolio with 3-5 real projects\n4. **Practice Coding**: Use platforms like LeetCode, HackerRank\n5. **Network**: Join tech communities, attend meetups\n6. **Consider Bootcamps**: Intensive programs can accelerate learning\n\nWould you like me to elaborate on any of these steps?",
        role: "assistant",
        timestamp: new Date("2024-01-15T10:01:00"),
      },
      {
        id: "1-3",
        content: "How long does this transition typically take?",
        role: "user",
        timestamp: new Date("2024-01-15T10:05:00"),
      },
      {
        id: "1-4",
        content: "The timeline varies based on your dedication and background:\n\n**6-12 months** (Full-time learning):\n- 6-8 hours daily\n- Bootcamp or intensive self-study\n- Strong portfolio ready\n\n**12-18 months** (Part-time):\n- 2-3 hours daily\n- Evening/weekend learning\n- Gradual skill building\n\n**18-24 months** (Casual pace):\n- 1-2 hours daily\n- Learning alongside current job\n- Steady progress\n\nYour marketing background is actually valuable - you understand user needs and business goals, which many developers lack!",
        role: "assistant",
        timestamp: new Date("2024-01-15T10:06:00"),
      },
    ],
  },
  {
    id: "2",
    title: "Resume Optimization for Tech Jobs",
    lastMessage: "How can I make my resume stand out?",
    timestamp: new Date("2024-01-14"),
    messages: [
      {
        id: "2-1",
        content: "I'm applying for frontend developer positions but not getting interviews. How can I make my resume stand out?",
        role: "user",
        timestamp: new Date("2024-01-14T14:30:00"),
      },
      {
        id: "2-2",
        content: "Here are key strategies to make your tech resume stand out:\n\n**1. Lead with Impact**\n- Use numbers: \"Increased page load speed by 40%\"\n- Quantify achievements: \"Built 15+ responsive websites\"\n\n**2. Technical Skills Section**\n- List relevant technologies prominently\n- Include proficiency levels\n- Match job requirements exactly\n\n**3. Project Portfolio**\n- Include 2-3 strong projects with live links\n- Describe the problem you solved\n- Mention technologies used\n\n**4. ATS Optimization**\n- Use standard section headers\n- Include keywords from job postings\n- Save as PDF to preserve formatting\n\nWould you like me to review a specific section of your resume?",
        role: "assistant",
        timestamp: new Date("2024-01-14T14:31:00"),
      },
      {
        id: "2-3",
        content: "What about the experience section? I don't have professional coding experience yet.",
        role: "user",
        timestamp: new Date("2024-01-14T14:35:00"),
      },
      {
        id: "2-4",
        content: "No problem! Here's how to handle the experience section without professional coding experience:\n\n**1. Highlight Transferable Skills**\n- Problem-solving from previous roles\n- Project management experience\n- Team collaboration skills\n\n**2. Emphasize Personal Projects**\n- Treat them like work experience\n- Include project duration and technologies\n- Describe challenges and solutions\n\n**3. Include Relevant Coursework**\n- Online courses, bootcamps, certifications\n- Mention completion dates and skills gained\n\n**4. Volunteer/Open Source Work**\n- Contributing to open source projects\n- Building websites for nonprofits\n- Teaching others to code\n\n**Example format:**\n\"Personal Projects | 2023-Present\n• Developed e-commerce website using React and Node.js\n• Implemented user authentication and payment processing\n• Deployed on AWS with 99.9% uptime\"",
        role: "assistant",
        timestamp: new Date("2024-01-14T14:36:00"),
      },
    ],
  },
  {
    id: "3",
    title: "Interview Preparation Strategies",
    lastMessage: "How should I prepare for technical interviews?",
    timestamp: new Date("2024-01-13"),
    messages: [
      {
        id: "3-1",
        content: "I have a technical interview next week for a full-stack developer position. How should I prepare?",
        role: "user",
        timestamp: new Date("2024-01-13T09:00:00"),
      },
      {
        id: "3-2",
        content: "Excellent! Here's a comprehensive preparation strategy:\n\n**Week Before:**\n1. **Review Job Description** - Focus on mentioned technologies\n2. **Practice Coding** - LeetCode, HackerRank (Easy-Medium problems)\n3. **Study System Design** - Basic concepts for full-stack roles\n4. **Prepare STAR Stories** - Behavioral questions with examples\n\n**Technical Topics to Review:**\n- Data structures (arrays, objects, trees)\n- Algorithms (sorting, searching)\n- Database concepts (SQL, NoSQL)\n- Web fundamentals (HTTP, REST APIs)\n- Framework-specific questions (React, Node.js)\n\n**Day Before:**\n- Get good sleep\n- Review your projects\n- Prepare questions to ask them\n- Test your setup (if remote)\n\nWhat specific technologies did they mention in the job description?",
        role: "assistant",
        timestamp: new Date("2024-01-13T09:01:00"),
      },
      {
        id: "3-3",
        content: "They mentioned React, Node.js, MongoDB, and AWS. Any specific areas I should focus on?",
        role: "user",
        timestamp: new Date("2024-01-13T09:05:00"),
      },
      {
        id: "3-4",
        content: "Perfect! Here are the key areas to focus on for those technologies:\n\n**React:**\n- Component lifecycle and hooks\n- State management (useState, useEffect)\n- Props vs state\n- Event handling\n- Virtual DOM concept\n\n**Node.js:**\n- Asynchronous programming (callbacks, promises, async/await)\n- Express.js basics\n- Middleware concepts\n- Error handling\n\n**MongoDB:**\n- CRUD operations\n- Schema design\n- Indexing basics\n- Aggregation pipeline\n- Mongoose ODM\n\n**AWS:**\n- EC2, S3, Lambda basics\n- Deployment strategies\n- Environment variables\n- Security best practices\n\n**Practice Questions:**\n- Build a simple REST API with Express\n- Create a React component with state\n- Design a database schema for a blog\n- Explain how you'd deploy a full-stack app\n\nGood luck! You've got this! 🚀",
        role: "assistant",
        timestamp: new Date("2024-01-13T09:06:00"),
      },
    ],
  },
  {
    id: "4",
    title: "Salary Negotiation Tips",
    lastMessage: "How do I negotiate a better salary offer?",
    timestamp: new Date("2024-01-12"),
    messages: [
      {
        id: "4-1",
        content: "I received a job offer but the salary is lower than expected. How should I negotiate?",
        role: "user",
        timestamp: new Date("2024-01-12T16:00:00"),
      },
      {
        id: "4-2",
        content: "Great question! Salary negotiation is a crucial skill. Here's how to approach it professionally:\n\n**Before Negotiating:**\n1. **Research Market Rates** - Glassdoor, PayScale, LinkedIn Salary\n2. **Know Your Value** - Unique skills, experience, achievements\n3. **Consider Total Package** - Benefits, equity, PTO, remote work\n4. **Set Your Range** - Minimum acceptable vs ideal salary\n\n**Negotiation Strategy:**\n- Express enthusiasm for the role\n- Present data-backed reasoning\n- Be specific about your ask\n- Show flexibility on other benefits\n- Practice your pitch\n\n**Example Script:**\n\"I'm excited about this opportunity and believe I can add significant value. Based on my research and experience with [specific skills], I was hoping we could discuss a salary in the range of $X-Y. I'm also open to discussing other aspects of the compensation package.\"\n\nWhat's the current offer and what's your target range?",
        role: "assistant",
        timestamp: new Date("2024-01-12T16:01:00"),
      },
      {
        id: "4-3",
        content: "They offered $75k but I was hoping for $85k. The role is for a mid-level developer position.",
        role: "user",
        timestamp: new Date("2024-01-12T16:05:00"),
      },
      {
        id: "4-4",
        content: "That's a reasonable gap to negotiate! Here's your strategy:\n\n**Your Approach:**\n1. **Acknowledge the offer positively**\n2. **Present your case with data**\n3. **Ask for $80-85k range**\n4. **Be prepared to compromise**\n\n**Sample Response:**\n\"Thank you for the offer! I'm excited about joining the team. Based on my research of mid-level developer salaries in this area and my experience with [specific technologies], I was hoping we could discuss a salary closer to $80-85k. I bring [specific value proposition] and I'm confident I can exceed expectations in this role.\"\n\n**If they counter with $78k:**\n- Consider if it's acceptable\n- Ask about other benefits (bonus, equity, flexible hours)\n- Negotiate for a 6-month review\n\n**Remember:**\n- Stay professional and positive\n- Don't make it personal\n- Have alternatives ready\n- Sometimes walking away is the right choice\n\nYou've got this! 💪",
        role: "assistant",
        timestamp: new Date("2024-01-12T16:06:00"),
      },
    ],
  },
  {
    id: "5",
    title: "Career Growth and Promotion",
    lastMessage: "How can I advance to senior developer?",
    timestamp: new Date("2024-01-11"),
    messages: [
      {
        id: "5-1",
        content: "I've been a junior developer for 2 years. How can I advance to a senior developer role?",
        role: "user",
        timestamp: new Date("2024-01-11T11:00:00"),
      },
      {
        id: "5-2",
        content: "Great question! Here's a roadmap to advance from junior to senior developer:\n\n**Technical Skills:**\n- **Master your stack** - Go beyond basics, learn advanced patterns\n- **Learn system design** - Scalability, performance, architecture\n- **Code quality** - Write clean, maintainable, testable code\n- **Debugging expertise** - Complex problem-solving skills\n- **New technologies** - Stay current with industry trends\n\n**Soft Skills:**\n- **Mentoring** - Help junior developers\n- **Communication** - Explain technical concepts clearly\n- **Leadership** - Take initiative on projects\n- **Business understanding** - Connect code to business value\n\n**Action Items:**\n1. Ask for more challenging projects\n2. Volunteer for code reviews\n3. Lead a small team or project\n4. Contribute to open source\n5. Get certifications in your field\n\nWhat's your current tech stack and what areas do you feel strongest in?",
        role: "assistant",
        timestamp: new Date("2024-01-11T11:01:00"),
      },
      {
        id: "5-3",
        content: "I work with React and Node.js. I feel strong in frontend but want to improve my backend skills and system design knowledge.",
        role: "user",
        timestamp: new Date("2024-01-11T11:05:00"),
      },
      {
        id: "5-4",
        content: "Perfect! Here's a focused plan for your React/Node.js stack:\n\n**Backend Skills to Develop:**\n- **Database Design** - Learn SQL optimization, indexing\n- **API Design** - RESTful principles, GraphQL basics\n- **Authentication** - JWT, OAuth, session management\n- **Testing** - Unit tests, integration tests\n- **DevOps** - Docker, CI/CD, monitoring\n\n**System Design Learning Path:**\n1. **Start Small** - Design a URL shortener, chat app\n2. **Study Patterns** - Load balancing, caching, microservices\n3. **Practice** - Use platforms like System Design Interview\n4. **Real Projects** - Apply concepts to your work\n\n**Immediate Actions:**\n- Take on more backend tasks at work\n- Build a full-stack side project\n- Read \"Designing Data-Intensive Applications\"\n- Join system design study groups\n- Ask senior developers to explain their architectural decisions\n\n**Timeline:** 6-12 months of focused learning should significantly improve your backend and system design skills!\n\nWhat's your biggest challenge with backend development currently?",
        role: "assistant",
        timestamp: new Date("2024-01-11T11:06:00"),
      },
    ],
  },
];
