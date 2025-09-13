"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send } from "lucide-react";
import { trpc } from "@/lib/trpc-client";

export default function ChatSessionPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // tRPC queries and mutations
  const { data: session, isLoading: sessionLoading, refetch } = trpc.getSession.useQuery(
    { sessionId },
    { enabled: !!sessionId }
  );
  
  const addMessageMutation = trpc.addMessage.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const updateTitleMutation = trpc.updateSessionTitle.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !session) return;

    const messageContent = inputMessage;
    setInputMessage("");
    setIsLoading(true);

    try {
      // Add user message
      addMessageMutation.mutate({
        sessionId,
        content: messageContent,
        role: "user",
      });

      // Update title if it's the first message
      if (session.title === "New Chat" && session.messages.length === 0) {
        const newTitle = messageContent.length > 30 
          ? messageContent.substring(0, 30) + "..."
          : messageContent;
        updateTitleMutation.mutate({
          sessionId,
          title: newTitle,
        });
      }

      // Get AI response from the existing API
      const requestBody = {
        message: messageContent,
        sessionId: sessionId
      };
      
      console.log("Sending request:", requestBody);
      
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        throw new Error(errorData.error || "Failed to get AI response");
      }
      
      const data = await response.json();
      console.log("Received response:", data);
      
      // Add assistant message
      addMessageMutation.mutate({
        sessionId,
        content: data.reply,
        role: "assistant",
      });

    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };


  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (sessionLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg">Loading chat session...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg">Session not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-blue-600" />
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            {session.title}
          </h1>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {session.messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Start a conversation</p>
              <p className="text-sm">Ask me anything about your career!</p>
            </div>
          </div>
        ) : (
          session.messages.map((message: any) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
