"use client";

import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc-client";
import { Button } from "@/components/ui/button";
import { MessageCircle, Plus } from "lucide-react";

export default function ChatPage() {
  const router = useRouter();
  const createSessionMutation = trpc.createSession.useMutation({
    onSuccess: (newSession) => {
      router.push(`/chat/${newSession.id}`);
    },
  });

  const handleStartNewChat = () => {
    createSessionMutation.mutate({ title: "New Chat" });
  };

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center space-y-8 max-w-md mx-auto px-6">
        <div className="space-y-4">
          <MessageCircle className="h-16 w-16 mx-auto text-blue-600 opacity-80" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Start Your Career Journey
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Start a new career guiding journey with our Career Guide AI
          </p>
        </div>
        
        <Button 
          onClick={handleStartNewChat}
          disabled={createSessionMutation.isPending}
          className="text-lg px-8 py-6 bg-blue-600 hover:bg-blue-700 text-white"
        >
          {createSessionMutation.isPending ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Creating...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>Start New Chat</span>
            </div>
          )}
        </Button>
      </div>
    </div>
  );
}