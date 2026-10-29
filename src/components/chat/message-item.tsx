"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChatMessage } from "@/lib/types";
import { useKnowledge } from "@/context/knowledge-context";
import { Copy, Check, RotateCw, FileText, Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageItemProps {
  message: ChatMessage;
  onRegenerate?: () => void;
  isStreaming?: boolean;
}

export function MessageItem({ message, onRegenerate, isStreaming }: MessageItemProps) {
  const { openCitation } = useKnowledge();
  const [copied, setCopied] = useState(false);
  const isAssistant = message.role === "assistant";

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Convert raw "[1]", "[2]" citation markers in markdown into interactive Apple pills
  const renderCustomMarkdown = (content: string) => {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p({ children }) {
            return (
              <p className="my-2.5 leading-[1.68] text-[14.5px] text-foreground tracking-[-0.01em]">
                {React.Children.map(children, (child) => {
                  if (typeof child === "string") {
                    const parts = child.split(/(\[\d+(?:,\s*\d+)*\])/g);
                    return parts.map((part, index) => {
                      const match = part.match(/\[(\d+(?:,\s*\d+)*)\]/);
                      if (match) {
                        const numbers = match[1].split(",").map((n) => parseInt(n.trim(), 10));
                        return (
                          <span key={index} className="inline-flex gap-1 mx-1 align-baseline">
                            {numbers.map((num) => {
                              const citation = message.source_references?.find(
                                (c) => c.citation_id === num
                              );
                              return (
                                <button
                                  key={num}
                                  onClick={() => citation && openCitation(citation)}
                                  className={cn(
                                    "inline-flex items-center justify-center px-1.5 py-0.5 text-[11px] font-mono font-medium rounded-md bg-black/6 dark:bg-white/12 text-foreground border border-black/10 dark:border-white/15 hover:bg-foreground hover:text-background transition-all duration-150 cursor-pointer shadow-subtle",
                                    !citation && "opacity-70 cursor-default"
                                  )}
                                  title={
                                    citation
                                      ? `Source [${num}]: ${citation.document_title}`
                                      : `Citation [${num}]`
                                  }
                                >
                                  [{num}]
                                </button>
                              );
                            })}
                          </span>
                        );
                      }
                      return part;
                    });
                  }
                  return child;
                })}
              </p>
            );
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-3 border border-border rounded-xl shadow-subtle">
                <table className="w-full text-left text-xs border-collapse bg-surface">{children}</table>
              </div>
            );
          },
          th({ children }) {
            return (
              <th className="px-3.5 py-2.5 bg-surface-secondary text-foreground font-semibold border-b border-border">
                {children}
              </th>
            );
          },
          td({ children }) {
            return (
              <td className="px-3.5 py-2.5 text-foreground border-b border-border/60">
                {children}
              </td>
            );
          },
          code({ className, children, ...props }) {
            return (
              <code
                className="bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded text-[13px] font-mono text-foreground border border-border/50"
                {...props}
              >
                {children}
              </code>
            );
          },
          pre({ children }) {
            return (
              <pre className="p-3.5 my-3 rounded-xl bg-surface-secondary border border-border text-xs font-mono overflow-x-auto text-foreground">
                {children}
              </pre>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    );
  };

  // Dedicated Clean Thinking State (Just like real chat typing indicator - no boxes, no model names, no labels)
  if (isAssistant && isStreaming && !message.content) {
    return (
      <div className="py-2.5 px-4 sm:px-6 transition-colors animate-fade-in">
        <div className="max-w-3xl w-full mx-auto flex items-center gap-3">
          <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center bg-foreground text-background shadow-apple select-none">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-black/[0.04] dark:bg-white/[0.08] backdrop-blur-xl">
            <span className="w-2 h-2 rounded-full bg-foreground/70 animate-dot-1" />
            <span className="w-2 h-2 rounded-full bg-foreground/70 animate-dot-2" />
            <span className="w-2 h-2 rounded-full bg-foreground/70 animate-dot-3" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "py-4 px-4 sm:px-6 transition-colors animate-fade-in",
        isAssistant ? "bg-transparent" : "flex justify-end"
      )}
    >
      <div className={cn("max-w-3xl w-full mx-auto", !isAssistant && "flex justify-end")}>
        {!isAssistant ? (
          /* User Bubble: Apple Messages Style */
          <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-white/80 dark:bg-white/[0.12] backdrop-blur-xl border border-black/8 dark:border-white/15 text-foreground shadow-apple text-[14.5px] leading-relaxed">
            {message.content}
          </div>
        ) : (
          /* Assistant Answer: Frosted Apple Card */
          <div className="flex gap-4 p-4 rounded-2xl bg-white/80 dark:bg-black/40 backdrop-blur-2xl border border-black/8 dark:border-white/10 shadow-sm">
            {/* Assistant Monogram */}
            <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs mt-0.5 bg-foreground text-background shadow-apple select-none">
              <Sparkles className="w-3.5 h-3.5" />
            </div>

            {/* Assistant Body */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-foreground">
                    KnowledgeOS
                  </span>
                </div>

                {/* Copy / Regenerate Actions */}
                {!isStreaming && (
                  <div className="flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity">
                    <button
                      onClick={handleCopy}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      title="Copy answer"
                      aria-label="Copy response"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    {onRegenerate && (
                      <button
                        onClick={onRegenerate}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        title="Regenerate answer"
                        aria-label="Regenerate response"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Rendered Text with typing cursor during streaming */}
              <div className="prose-apple">
                {renderCustomMarkdown(message.content)}
                {isStreaming && (
                  <span className="inline-block w-1.5 h-4 ml-1 bg-foreground animate-pulse align-middle" />
                )}
              </div>

              {/* Source References Section */}
              {message.source_references && message.source_references.length > 0 && (
                <div className="mt-4 pt-3.5 border-t border-black/8 dark:border-white/10">
                  <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 opacity-80" />
                    Verified Citations ({message.source_references.length})
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {message.source_references.map((citation) => (
                      <button
                        key={citation.citation_id}
                        onClick={() => openCitation(citation)}
                        className="text-left p-3 rounded-xl bg-white/60 dark:bg-white/[0.05] backdrop-blur-xl border border-black/8 dark:border-white/12 hover:border-foreground/40 hover:bg-white/80 dark:hover:bg-white/[0.09] transition-all group flex items-start gap-2.5 shadow-subtle"
                      >
                        <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-black/6 dark:bg-white/12 text-foreground border border-black/10 dark:border-white/15 flex-shrink-0 group-hover:bg-foreground group-hover:text-background transition-colors">
                          [{citation.citation_id}]
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-foreground truncate group-hover:opacity-90">
                            {citation.document_title}
                          </div>
                          <div className="text-[11px] text-muted-foreground truncate mt-0.5">
                            {citation.page_number ? `Page ${citation.page_number}` : "Section"}
                            {citation.section_title ? ` · ${citation.section_title}` : ""}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
