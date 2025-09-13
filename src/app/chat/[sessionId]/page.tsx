"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, User, Bot, Check, CheckCheck } from "lucide-react";
import { trpc } from "@/lib/trpc-client";

export default function ChatSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingMessageId, setPendingMessageId] = useState<string | null>(null);
  const [optimisticMessages, setOptimisticMessages] = useState<any[]>([]);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  
  // tRPC queries and mutations
  const { data: session, isLoading: sessionLoading, error: sessionError } = trpc.getSession.useQuery(
    { sessionId },
    { 
      enabled: !!sessionId,
      retry: false, // Don't retry on 404 errors
    }
  );

  // Handle error redirect
  React.useEffect(() => {
    if (sessionError && sessionError.message.includes('not found')) {
      router.push('/chat');
    }
  }, [sessionError, router]);

  // Helper function to check if message is pending
  const isMessagePending = (messageId: string) => {
    return pendingMessageId === messageId;
  };

  // Scroll to bottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom when session data changes
  React.useEffect(() => {
    if (session?.messages && session.messages.length > 0) {
      setTimeout(scrollToBottom, 100);
    }
  }, [session?.messages]);
  
  const utils = trpc.useUtils();
  
  const addMessageMutation = trpc.addMessage.useMutation({
    onSuccess: () => {
      // Invalidate and refetch session query
      utils.getSession.invalidate({ sessionId });
    },
  });

  const addUserMessageMutation = trpc.addMessage.useMutation({
    onSuccess: (sessionData) => {
      // Set the most recent user message as pending
      const userMessages = sessionData.messages.filter((msg: any) => msg.role === "user");
      if (userMessages.length > 0) {
        const lastUserMessage = userMessages[userMessages.length - 1];
        setPendingMessageId(lastUserMessage.id);
      }
      // Don't invalidate yet - keep showing optimistic message
      // utils.getSession.invalidate({ sessionId });
    },
  });

  const updateTitleMutation = trpc.updateSessionTitle.useMutation({
    onSuccess: () => {
      // Invalidate and refetch session query
      utils.getSession.invalidate({ sessionId });
    },
  });

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !session) return;

    const messageContent = inputMessage;
    const tempMessageId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create optimistic message immediately
    const optimisticMessage = {
      id: tempMessageId,
      content: messageContent,
      role: "user" as const,
      timestamp: new Date().toISOString(),
    };
    
    // Add optimistic message immediately to UI
    setOptimisticMessages([optimisticMessage]);
    setInputMessage("");
    setIsLoading(true);
    
    // Scroll to bottom after adding optimistic message
    setTimeout(scrollToBottom, 100);

    try {
      // Add user message to database
      addUserMessageMutation.mutate({
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
      
      // Clear pending status and optimistic messages when AI responds
      setPendingMessageId(null);
      setOptimisticMessages([]);
      
      // Invalidate session to get real messages
      utils.getSession.invalidate({ sessionId });
      
      // Add assistant message
      addMessageMutation.mutate({
        sessionId,
        content: data.reply,
        role: "assistant",
      });
      
      // Scroll to bottom after AI response
      setTimeout(scrollToBottom, 200);

    } catch (error) {
      console.error("Error sending message:", error);
      // Remove optimistic message on error
      setOptimisticMessages([]);
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

  // Message status indicator component
  const MessageStatusIndicator = ({ messageId }: { messageId: string }) => {
    const isPending = isMessagePending(messageId);
    const isOptimistic = messageId.startsWith('temp-');
    
    // If it's an optimistic message or pending, show single tick
    // Otherwise show double tick (delivered)
    const showSingleTick = isOptimistic || isPending;
    
    return (
      <div className="flex items-center ml-1">
        {showSingleTick ? (
          <Check className="h-3 w-3 text-gray-500 dark:text-gray-400" />
        ) : (
          <CheckCheck className="h-3 w-3 text-green-500" />
        )}
      </div>
    );
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
    <div className="flex-1 flex flex-col h-full">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-200 dark:to-gray-300 border-b border-gray-600 dark:border-gray-400 p-3 lg:p-4 flex-shrink-0 chat-header">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 lg:h-5 lg:w-5 text-white flex-shrink-0" />
          <h1 className="text-sm lg:text-lg font-semibold text-white truncate">
            {session.title}
          </h1>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-2 lg:p-4 space-y-3 lg:space-y-4 bg-gray-50 dark:bg-black chat-messages-area">
        {(!session.messages || session.messages.length === 0) && optimisticMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full px-4">
            <div className="text-center text-gray-500 dark:text-gray-300">
              <MessageCircle className="h-8 w-8 lg:h-12 lg:w-12 mx-auto mb-3 lg:mb-4 opacity-50" />
              <p className="text-base lg:text-lg">Start a conversation</p>
              <p className="text-xs lg:text-sm">Ask me anything about your career!</p>
            </div>
          </div>
        ) : (
          [...(session.messages || []), ...optimisticMessages]
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
            .map((message: any) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} gap-2`}
            >
              {/* AI Icon - Only show for AI messages */}
              {message.role === "assistant" && (
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-200 rounded-full flex items-center justify-center mt-1">
                  <Bot className="h-4 w-4 text-blue-600 dark:text-blue-700" />
                </div>
              )}
              
              <div
                className={`max-w-[85%] sm:max-w-xs lg:max-w-md px-3 lg:px-4 py-2 lg:py-3 rounded-lg ${
                  message.role === "user"
                    ? "bg-gray-700 dark:bg-gray-700 text-white message-bubble-user"
                    : "bg-gray-300 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-400 dark:border-gray-600 message-bubble-ai"
                }`}
              >
                <p className="text-xs lg:text-sm break-words whitespace-pre-wrap">{message.content}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs opacity-70">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                  {message.role === "user" && (
                    <MessageStatusIndicator messageId={message.id} />
                  )}
                </div>
              </div>
              
              {/* User Icon - Only show for user messages */}
              {message.role === "user" && (
                <div className="flex-shrink-0 w-8 h-8 bg-gray-200 dark:bg-gray-400 rounded-full flex items-center justify-center mt-1">
                  <User className="h-4 w-4 text-gray-600 dark:text-gray-700" />
                </div>
              )}
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-start gap-2">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-200 rounded-full flex items-center justify-center mt-1">
              <Bot className="h-4 w-4 text-blue-600 dark:text-blue-700" />
            </div>
            <div className="bg-gray-300 dark:bg-gray-800 text-gray-900 dark:text-white max-w-[85%] sm:max-w-xs lg:max-w-md px-3 lg:px-4 py-2 lg:py-3 rounded-lg border border-gray-400 dark:border-gray-600 message-bubble-ai">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-3 w-3 lg:h-4 lg:w-4 border-b-2 border-gray-600"></div>
                  <span className="text-xs lg:text-sm">
                    Typing
                    <span className="inline-block animate-pulse">.</span>
                    <span className="inline-block animate-pulse" style={{ animationDelay: '0.2s' }}>.</span>
                    <span className="inline-block animate-pulse" style={{ animationDelay: '0.4s' }}>.</span>
                  </span>
                </div>
            </div>
          </div>
        )}
        
        {/* Scroll target */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-gray-100 dark:bg-gray-800 border-t border-gray-300 dark:border-gray-600 p-2 lg:p-4 flex-shrink-0 chat-input-area">
        <div className="flex gap-1 lg:gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1 text-sm lg:text-base py-2 lg:py-3 text-gray-900 dark:text-white bg-white dark:bg-gray-200 border-gray-300 dark:border-gray-500 placeholder:text-gray-500 dark:placeholder:text-gray-400"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            size="icon"
            className="h-8 w-8 lg:h-10 lg:w-10 flex-shrink-0"
          >
            <Send className="h-3 w-3 lg:h-4 lg:w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
