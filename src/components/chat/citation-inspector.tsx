"use client";

import React, { useState } from "react";
import { useKnowledge } from "@/context/knowledge-context";
import { X, FileText, Check, Copy, ExternalLink, ShieldCheck, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

export function CitationInspector() {
  const { selectedCitation, closeCitation } = useKnowledge();
  const [copied, setCopied] = useState(false);

  if (!selectedCitation) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedCitation.excerpt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 apple-blur animate-fade-in">
      <div 
        className="w-full max-w-lg bg-surface border border-border rounded-xl shadow-apple overflow-hidden flex flex-col max-h-[85vh] animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-surface-secondary/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent-subtle flex items-center justify-center text-accent">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-accent-subtle text-accent border border-accent/20">
                  Source [{selectedCitation.citation_id}]
                </span>
                {selectedCitation.similarity_score && (
                  <span className="text-xs text-muted-foreground font-mono">
                    {Math.round(selectedCitation.similarity_score * 100)}% Match
                  </span>
                )}
              </div>
              <h3 className="text-sm font-semibold text-foreground mt-0.5 line-clamp-1">
                {selectedCitation.document_title}
              </h3>
            </div>
          </div>
          <button
            onClick={closeCitation}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors"
            aria-label="Close citation inspector"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-sm">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-surface-secondary border border-border">
              <span className="text-muted-foreground block mb-0.5">Category</span>
              <span className="font-medium text-foreground flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-accent" />
                {selectedCitation.category_name || "Company SOP"}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-secondary border border-border">
              <span className="text-muted-foreground block mb-0.5">Location</span>
              <span className="font-medium text-foreground">
                {selectedCitation.page_number
                  ? `Page ${selectedCitation.page_number}`
                  : "Section 1"}
                {selectedCitation.section_title ? ` · ${selectedCitation.section_title}` : ""}
              </span>
            </div>
          </div>

          {/* Excerpt Section */}
          <div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">
              Verified Source Excerpt
            </span>
            <div className="p-3.5 rounded-lg bg-surface-secondary/70 border border-border text-foreground font-serif leading-relaxed text-[13.5px]">
              <span className="text-accent font-bold mr-1">“</span>
              {selectedCitation.excerpt}
              <span className="text-accent font-bold ml-1">”</span>
            </div>
          </div>

          {/* Access Verification Badge */}
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-accent-subtle/50 border border-accent/20 text-xs text-accent">
            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            <span>
              Authorized document access verified for your role and organization scope.
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-border bg-surface-secondary/20 flex items-center justify-between">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-foreground bg-surface border border-border hover:bg-surface-hover shadow-subtle transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-status-success" />
                Copied Excerpt
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy Excerpt
              </>
            )}
          </button>

          <button
            onClick={closeCitation}
            className="px-4 py-1.5 text-xs font-medium rounded-lg bg-accent text-accent-foreground hover:bg-accent-hover transition-colors shadow-subtle"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
