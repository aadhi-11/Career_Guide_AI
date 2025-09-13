"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MessageCircle, Plus } from "lucide-react";
import { trpc } from "@/lib/trpc-client";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // tRPC queries and mutations
  const { data: chatSessions = [], isLoading, refetch } = trpc.getSessions.useQuery();
  const resetSessionsMutation = trpc.resetSessions.useMutation({
    onSuccess: () => {
      refetch();
    },
  });
  const createSessionMutation = trpc.createSession.useMutation({
    onSuccess: (newSession) => {
      refetch();
      setActiveSessionId(newSession.id);
      router.push(`/chat/${newSession.id}`);
    },
  });

  // Reset sessions on mount to ensure only 5 mock sessions
  React.useEffect(() => {
    resetSessionsMutation.mutate();
  }, []);

  const createNewChat = () => {
    createSessionMutation.mutate({ title: "New Chat" });
  };

  const selectChatSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    router.push(`/chat/${sessionId}`);
  };

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-1/4 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <Button 
            onClick={createNewChat}
            className="w-full justify-start gap-2"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-2">
              {chatSessions.map((session: any) => (
                <div
                  key={session.id}
                  onClick={() => selectChatSession(session.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    activeSessionId === session.id
                      ? "bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-700"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <div className="font-medium text-sm text-gray-900 dark:text-white truncate">
                    {session.title}
                  </div>
                  {session.lastMessage && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                      {session.lastMessage}
                    </div>
                  )}
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {new Date(session.timestamp).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Content */}
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}