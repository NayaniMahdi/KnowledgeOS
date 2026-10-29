"use client";

import React, { useState, useRef, useEffect } from "react";
import { useKnowledge } from "@/context/knowledge-context";
import { ArrowUp, Square, Paperclip, ChevronDown, Check, Sparkles } from "lucide-react";
import { SUPPORTED_MODELS } from "@/lib/ai/models";
import { cn } from "@/lib/utils";

interface ChatComposerProps {
  onSendMessage: (message: string) => void;
  onStopGeneration?: () => void;
  isStreaming?: boolean;
  onOpenUpload?: () => void;
}

export function ChatComposer({
  onSendMessage,
  onStopGeneration,
  isStreaming,
  onOpenUpload,
}: ChatComposerProps) {
  const { selectedModel, setSelectedModel, selectedProvider, setSelectedProvider } = useKnowledge();
  const [input, setInput] = useState("");
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const selectorRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea up to 200px
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  // Close model dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
        setIsModelSelectorOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!input.trim() || isStreaming) return;
    onSendMessage(input.trim());
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const activeModelObj = SUPPORTED_MODELS.find((m) => m.id === selectedModel);

  return (
    <div className="relative w-full max-w-3xl mx-auto px-4 pb-4">
      {/* Model Selection Dropdown Popover */}
      {isModelSelectorOpen && (
        <div
          ref={selectorRef}
          className="absolute bottom-full mb-2 left-4 w-72 sm:w-80 bg-surface border border-border rounded-xl shadow-apple p-2 z-30 animate-fade-in"
        >
          <div className="text-[11px] font-semibold text-muted-foreground uppercase px-2 py-1 tracking-wider">
            Active Provider & Model
          </div>
          <div className="max-h-60 overflow-y-auto space-y-1">
            {SUPPORTED_MODELS.map((model) => (
              <button
                key={model.id}
                onClick={() => {
                  setSelectedModel(model.id);
                  setSelectedProvider(model.provider);
                  setIsModelSelectorOpen(false);
                }}
                className={cn(
                  "w-full text-left p-2 rounded-lg text-xs flex items-center justify-between transition-colors",
                  selectedModel === model.id
                    ? "bg-accent-subtle text-accent font-medium"
                    : "hover:bg-surface-hover text-foreground"
                )}
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="truncate">{model.name}</span>
                    {model.is_free && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-status-success/15 text-status-success font-medium">
                        Free
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-muted-foreground capitalize mt-0.5">
                    {model.provider}
                  </div>
                </div>
                {selectedModel === model.id && <Check className="w-4 h-4 flex-shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Composer Box */}
      <div className="relative flex flex-col bg-surface border border-border rounded-2xl shadow-apple transition-shadow hover:shadow-apple-hover focus-within:border-accent/60">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about company policies, SOPs, pricing, or procedures..."
          rows={1}
          className="w-full resize-none bg-transparent px-4 pt-3.5 pb-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none leading-relaxed max-h-[200px]"
        />

        {/* Footer Controls */}
        <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
          {/* Left: Model Pill & Attachment */}
          <div className="flex items-center gap-1.5">
            {/* Model Pill Button */}
            <button
              onClick={() => setIsModelSelectorOpen(!isModelSelectorOpen)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-surface-secondary text-foreground hover:bg-surface-hover border border-border transition-colors select-none"
              title="Change active model"
            >
              <Sparkles className="w-3 h-3 text-accent" />
              <span className="truncate max-w-[130px] sm:max-w-[170px]">
                {activeModelObj?.name || selectedModel}
              </span>
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </button>

            {/* Quick Upload Button */}
            {onOpenUpload && (
              <button
                onClick={onOpenUpload}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors"
                title="Upload document to knowledge base"
                aria-label="Upload document"
              >
                <Paperclip className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right: Send or Stop Button */}
          <div className="flex items-center gap-2">
            {isStreaming ? (
              <button
                onClick={onStopGeneration}
                className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center hover:opacity-90 transition-opacity"
                title="Stop generating"
                aria-label="Stop generating"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!input.trim()}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-subtle",
                  input.trim()
                    ? "bg-accent text-accent-foreground hover:bg-accent-hover scale-100"
                    : "bg-surface-secondary text-muted-foreground cursor-not-allowed opacity-50"
                )}
                title="Send message"
                aria-label="Send message"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="text-center mt-2">
        <span className="text-[11px] text-muted-foreground">
          KnowledgeOS answers are strictly grounded in authorized internal company documents.
        </span>
      </div>
    </div>
  );
}
