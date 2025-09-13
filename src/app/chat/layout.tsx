"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MessageCircle, Plus, ChevronLeft, ChevronRight, Menu, X, Home } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { trpc } from "@/lib/trpc-client";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sessionsPerPage = 7;

  // tRPC queries and mutations
  const { data: sessionsData, isLoading } = trpc.getSessions.useQuery({
    page: currentPage,
    limit: sessionsPerPage,
  });
  
  const chatSessions = sessionsData?.sessions || [];
  const pagination = sessionsData?.pagination;
  
  const utils = trpc.useUtils();
  
  const createSessionMutation = trpc.createSession.useMutation({
    onSuccess: (newSession) => {
      // Invalidate and refetch sessions query
      utils.getSessions.invalidate();
      setActiveSessionId(newSession.id);
      router.push(`/chat/${newSession.id}`);
    },
  });


  const createNewChat = () => {
    createSessionMutation.mutate({ title: "New Chat" });
  };

  const selectChatSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    router.push(`/chat/${sessionId}`);
    setSidebarOpen(false); // Close sidebar on mobile after selection
  };

  const goToNextPage = () => {
    if (pagination?.hasNextPage) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (pagination?.hasPreviousPage) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
        w-80 lg:w-1/4 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 chat-sidebar
        border-r border-blue-200 dark:border-gray-700 
        flex flex-col transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header Row */}
        <div className="p-2 sm:p-3 lg:p-4 border-b border-gray-200 dark:border-gray-600 bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-700 dark:to-gray-800 chat-header">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-sm sm:text-base lg:text-lg xl:text-xl font-bold text-white hover:text-blue-100 dark:text-white dark:hover:text-gray-300 transition-colors duration-200 cursor-pointer group"
            >
              <Home className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 group-hover:scale-110 transition-transform duration-200" />
              <span className="truncate pr-2">Career Guide AI</span>
            </button>
            <div className="flex items-center gap-2">
              <ThemeToggle />
            <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-white dark:bg-gray-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-500 hover:scale-105 transition-all duration-200 flex-shrink-0 a-logo">
              <span className="text-gray-800 dark:text-black font-bold text-xs sm:text-sm lg:text-base">A</span>
            </div>
            </div>
          </div>
        </div>

        {/* New Chat Button */}
        <div className="p-2 sm:p-3 lg:p-4 border-b border-gray-300 dark:border-gray-600">
          <Button 
            onClick={createNewChat}
            className="w-full justify-start gap-1 sm:gap-2 text-xs sm:text-sm lg:text-base py-2 sm:py-2 lg:py-3 cursor-pointer min-h-[44px] bg-gray-700 hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 text-white font-semibold hover:scale-[1.02] hover:shadow-lg transition-all duration-200 group"
          >
            <Plus className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 group-hover:rotate-90 transition-transform duration-200" />
            <span className="hidden sm:inline">New Chat</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 lg:p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-24 lg:h-32">
              <div className="animate-spin rounded-full h-6 w-6 lg:h-8 lg:w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
          <div className="space-y-1 lg:space-y-2">
              {chatSessions.map((session: any) => (
              <div
                key={session.id}
                onClick={() => selectChatSession(session.id)}
                className={`p-2 lg:p-3 rounded-lg cursor-pointer transition-colors ${
                  activeSessionId === session.id
                    ? "bg-gray-300 dark:bg-gray-700 border border-gray-400 dark:border-gray-500 shadow-sm"
                    : "hover:bg-gray-200 dark:hover:bg-gray-800 hover:shadow-sm"
                }`}
              >
                <div className="font-medium text-xs lg:text-sm text-gray-900 dark:text-white truncate">
                  {session.title}
                </div>
                {session.lastMessage && (
                  <div className="text-xs text-gray-500 dark:text-gray-300 truncate mt-1 line-clamp-2">
                    {session.lastMessage}
                  </div>
                )}
                <div className="text-xs text-gray-400 dark:text-gray-400 mt-1">
                  {new Date(session.timestamp).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
          )}
        </div>

        {/* Pagination Controls */}
        {pagination && pagination.totalPages > 1 && (
          <div className="p-2 lg:p-4 border-t border-gray-300 dark:border-gray-600">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                <span className="hidden sm:inline">Page {pagination.currentPage} of {pagination.totalPages}</span>
                <span className="sm:hidden">{pagination.currentPage}/{pagination.totalPages}</span>
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">
                {pagination.totalCount} total
              </span>
            </div>
            <div className="flex gap-1 lg:gap-2">
              <Button
                onClick={goToPreviousPage}
                disabled={!pagination.hasPreviousPage}
                variant="outline"
                size="sm"
                className="flex-1 text-xs lg:text-sm py-1 lg:py-2 cursor-pointer"
              >
                <ChevronLeft className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Previous</span>
                <span className="sm:hidden">Prev</span>
              </Button>
              <Button
                onClick={goToNextPage}
                disabled={!pagination.hasNextPage}
                variant="outline"
                size="sm"
                className="flex-1 text-xs lg:text-sm py-1 lg:py-2 cursor-pointer"
              >
                <span className="hidden sm:inline">Next</span>
                <span className="sm:hidden">Next</span>
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
        </div>
          </div>
        )}
      </div>

      {/* Chat Content */}
      <div className="flex-1 flex flex-col w-full lg:w-3/4">
        {children}
      </div>
    </div>
  );
}