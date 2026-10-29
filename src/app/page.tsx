"use client";

import React, { useState, useEffect, useRef } from "react";
import { useKnowledge } from "@/context/knowledge-context";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { WelcomeScreen } from "@/components/chat/welcome-screen";
import { MessageItem } from "@/components/chat/message-item";
import { ChatComposer } from "@/components/chat/chat-composer";
import { DocumentUploadModal } from "@/components/documents/document-upload-modal";
import { ChatMessage } from "@/lib/types";

export default function ChatPage() {
  const {
    activeConversationId,
    setActiveConversationId,
    selectedModel,
    selectedProvider,
    currentUser,
    fetchConversations,
  } = useKnowledge();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      try {
        const res = await fetch(`/api/conversations/${activeConversationId}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages || []);
        }
      } catch (err) {
        console.error("Failed to load messages:", err);
      }
    };

    loadMessages();
  }, [activeConversationId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  // Send message handler with streaming SSE response
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isStreaming) return;

    // Optimistically add user message
    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      conversation_id: activeConversationId || "new",
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    setIsStreaming(true);
    setStreamingContent("");

    abortControllerRef.current = new AbortController();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          conversationId: activeConversationId,
          message: text,
          provider: selectedProvider,
          model: selectedModel,
          userRole: currentUser.role,
          userDepartment: currentUser.department,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Failed to process chat response");
      }

      // Read custom headers
      const convIdHeader = res.headers.get("X-Conversation-Id");
      if (convIdHeader && convIdHeader !== activeConversationId) {
        setActiveConversationId(convIdHeader);
        fetchConversations();
      }

      const citationsHeader = res.headers.get("X-Citations");
      let headerCitations = [];
      if (citationsHeader) {
        try {
          headerCitations = JSON.parse(decodeURIComponent(citationsHeader));
        } catch {
          // ignore parsing error
        }
      }

      // Stream SSE chunks
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";
      let finalCitations = headerCitations;
      let finalModelUsed = res.headers.get("X-Model-Used") || selectedModel;

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n\n");

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith("data: ")) {
              try {
                const event = JSON.parse(trimmed.slice(6));
                if (event.text) {
                  accumulatedText += event.text;
                  setStreamingContent(accumulatedText);
                }
                if (event.done) {
                  if (event.citations) finalCitations = event.citations;
                  if (event.modelUsed) finalModelUsed = event.modelUsed;
                  if (event.conversationId && event.conversationId !== activeConversationId) {
                    setActiveConversationId(event.conversationId);
                  }
                  if (event.title || event.conversationId) {
                    fetchConversations();
                  }
                }
              } catch {
                // partial SSE line
              }
            }
          }
        }
      }

      // Add final assistant message
      const assistantMsg: ChatMessage = {
        id: `ast-${Date.now()}`,
        conversation_id: convIdHeader || activeConversationId || "conv",
        role: "assistant",
        content: accumulatedText,
        source_references: finalCitations,
        model_identifier: finalModelUsed,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setStreamingContent("");
      fetchConversations();
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("Chat error:", err);
        const errorMsg: ChatMessage = {
          id: `err-${Date.now()}`,
          conversation_id: activeConversationId || "conv",
          role: "assistant",
          content: `⚠️ **Request Error**: ${err.message || "An unexpected error occurred while contacting the model provider."}`,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
      if (streamingContent) {
        const partialMsg: ChatMessage = {
          id: `ast-aborted-${Date.now()}`,
          conversation_id: activeConversationId || "conv",
          role: "assistant",
          content: streamingContent + " *(generation stopped)*",
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, partialMsg]);
        setStreamingContent("");
      }
    }
  };

  const handleRegenerate = () => {
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
    if (lastUserMessage) {
      handleSendMessage(lastUserMessage.content);
    }
  };

  return (
    <div className="flex h-screen bg-transparent text-foreground overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        isOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        <Header
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          title="Knowledge Assistant"
        />

        {/* Message History or Welcome State */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          {messages.length === 0 ? (
            <WelcomeScreen onSelectPrompt={handleSendMessage} />
          ) : (
            <div className="py-4 space-y-1">
              {messages.map((msg) => (
                <MessageItem
                  key={msg.id}
                  message={msg}
                  onRegenerate={handleRegenerate}
                />
              ))}

              {/* Streaming Assistant Response (Shows 3 dancing dots while waiting, then streams text) */}
              {isStreaming && (
                <MessageItem
                  message={{
                    id: "streaming",
                    conversation_id: activeConversationId || "",
                    role: "assistant",
                    content: streamingContent,
                    model_identifier: selectedModel,
                    created_at: new Date().toISOString(),
                  }}
                  isStreaming={true}
                />
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Chat Composer */}
        <ChatComposer
          onSendMessage={handleSendMessage}
          onStopGeneration={handleStopGeneration}
          isStreaming={isStreaming}
          onOpenUpload={() => setIsUploadModalOpen(true)}
        />
      </div>

      {/* Document Upload Modal */}
      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>
  );
}
