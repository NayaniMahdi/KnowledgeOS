"use client";

import React, { useState } from "react";
import { useKnowledge } from "@/context/knowledge-context";
import { X, FileText, Check, Copy, ShieldCheck, Tag } from "lucide-react";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 apple-blur animate-fade-in">
      <div 
        className="w-full max-w-lg bg-white/80 dark:bg-[#121214]/85 backdrop-blur-3xl border border-black/10 dark:border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/8 dark:border-white/10 bg-white/40 dark:bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-black/5 dark:bg-white/10 flex items-center justify-center text-foreground shadow-subtle">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-foreground text-background">
                  Source [{selectedCitation.citation_id}]
                </span>
                {selectedCitation.similarity_score && (
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {Math.round(selectedCitation.similarity_score * 100)}% Match
                  </span>
                )}
              </div>
              <h3 className="text-[13.5px] font-semibold text-foreground mt-0.5 line-clamp-1 tracking-tight">
                {selectedCitation.document_title}
              </h3>
            </div>
          </div>
          <button
            onClick={closeCitation}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            aria-label="Close citation inspector"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-xl bg-white/50 dark:bg-white/[0.04] backdrop-blur-md border border-black/8 dark:border-white/10">
              <span className="text-muted-foreground text-[10.5px] block mb-0.5 font-medium">Category</span>
              <span className="font-semibold text-foreground flex items-center gap-1.5 text-xs">
                <Tag className="w-3.5 h-3.5 opacity-70" />
                {selectedCitation.category_name || "Company SOP"}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white/50 dark:bg-white/[0.04] backdrop-blur-md border border-black/8 dark:border-white/10">
              <span className="text-muted-foreground text-[10.5px] block mb-0.5 font-medium">Location</span>
              <span className="font-semibold text-foreground text-xs">
                {selectedCitation.page_number
                  ? `Page ${selectedCitation.page_number}`
                  : "Section 1"}
                {selectedCitation.section_title ? ` · ${selectedCitation.section_title}` : ""}
              </span>
            </div>
          </div>

          {/* Excerpt Section */}
          <div>
            <span className="text-[10.5px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
              Verified Source Excerpt
            </span>
            <div className="p-4 rounded-xl bg-white/50 dark:bg-white/[0.03] backdrop-blur-md border border-black/8 dark:border-white/10 text-foreground font-serif leading-relaxed text-[14px]">
              <span className="font-sans font-bold mr-1 opacity-60">“</span>
              {selectedCitation.excerpt}
              <span className="font-sans font-bold ml-1 opacity-60">”</span>
            </div>
          </div>

          {/* Access Verification Badge */}
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/50 dark:bg-white/[0.04] backdrop-blur-md border border-black/8 dark:border-white/10 text-xs text-foreground">
            <ShieldCheck className="w-4 h-4 flex-shrink-0 opacity-80" />
            <span className="text-[11.5px]">
              Authorized document access verified for your role and department.
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-black/8 dark:border-white/10 bg-white/40 dark:bg-white/[0.02] flex items-center justify-between">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl text-foreground bg-white/60 dark:bg-white/10 border border-black/8 dark:border-white/12 hover:bg-white/80 dark:hover:bg-white/15 shadow-subtle transition-colors"
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
            className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-foreground text-background hover:opacity-90 transition-opacity shadow-apple"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
