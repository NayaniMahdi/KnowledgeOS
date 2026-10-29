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
    const currentVal = input.trim() || textareaRef.current?.value.trim() || "";
    if (!currentVal || isStreaming) return;
    onSendMessage(currentVal);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.value = "";
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
          className="absolute bottom-full mb-2 left-4 w-72 sm:w-80 bg-white/85 dark:bg-black/85 backdrop-blur-3xl border border-black/10 dark:border-white/15 rounded-2xl shadow-2xl p-2 z-30 animate-fade-in"
        >
          <div className="text-[10.5px] font-semibold text-muted-foreground uppercase px-2 py-1 tracking-wider">
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
                  "w-full text-left p-2 rounded-xl text-xs flex items-center justify-between transition-colors",
                  selectedModel === model.id
                    ? "bg-black/8 dark:bg-white/12 text-foreground font-semibold"
                    : "hover:bg-black/4 dark:hover:bg-white/5 text-foreground"
                )}
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="truncate">{model.name}</span>
                    {model.is_free && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-black/6 dark:bg-white/12 text-foreground font-mono">
                        Free
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-muted-foreground capitalize mt-0.5">
                    {model.provider}
                  </div>
                </div>
                {selectedModel === model.id && <Check className="w-3.5 h-3.5 text-foreground flex-shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Floating Apple-Style Composer Box */}
      <div className="relative flex flex-col bg-white/80 dark:bg-black/70 backdrop-blur-3xl border border-black/10 dark:border-white/15 rounded-2xl shadow-2xl transition-all hover:shadow-apple-hover focus-within:border-foreground/35 focus-within:bg-white/90 dark:focus-within:bg-black/80">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about policies, procedures, pricing, or internal projects..."
          rows={1}
          className="w-full resize-none bg-transparent px-4 pt-3.5 pb-2 text-[14.5px] text-foreground placeholder:text-muted-foreground focus:outline-none leading-relaxed max-h-[200px]"
        />

        {/* Footer Controls */}
        <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
          {/* Left: Model Pill & Attachment */}
          <div className="flex items-center gap-1.5">
            {/* Model Pill Button */}
            <button
              onClick={() => setIsModelSelectorOpen(!isModelSelectorOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11.5px] font-medium bg-white/60 dark:bg-white/10 text-foreground hover:bg-white/80 dark:hover:bg-white/15 border border-black/8 dark:border-white/12 transition-colors select-none shadow-subtle"
              title="Change active model"
            >
              <Sparkles className="w-3 h-3 opacity-70" />
              <span className="truncate max-w-[130px] sm:max-w-[170px]">
                {activeModelObj?.name || selectedModel}
              </span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {/* Quick Upload Button */}
            {onOpenUpload && (
              <button
                onClick={onOpenUpload}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                title="Upload document to knowledge base"
                aria-label="Upload document"
              >
                <Paperclip className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right: Send or Stop Button (Apple Circular Control) */}
          <div className="flex items-center gap-2">
            {isStreaming ? (
              <button
                onClick={onStopGeneration}
                className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center hover:opacity-90 active:scale-95 transition-all shadow-apple"
                title="Stop generating"
                aria-label="Stop generating"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </button>
            ) : (
              <button
                id="send-message-btn"
                onClick={handleSubmit}
                disabled={!input.trim()}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-apple",
                  input.trim()
                    ? "bg-foreground text-background hover:opacity-90 active:scale-95 cursor-pointer"
                    : "bg-black/5 dark:bg-white/10 text-muted-foreground cursor-not-allowed opacity-40"
                )}
                title="Send message"
                aria-label="Send message"
              >
                <ArrowUp className="w-4 h-4 stroke-[2.2]" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="text-center mt-2.5">
        <span className="text-[11px] text-muted-foreground">
          KnowledgeOS answers are grounded in approved internal documents • Private & confidential
        </span>
      </div>
    </div>
  );
}
