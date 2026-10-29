"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useKnowledge } from "@/context/knowledge-context";
import { DocumentChunk, SourceCitation } from "@/lib/types";
import { Search, ArrowRight, ShieldCheck, Tag } from "lucide-react";
import { MOCK_CHUNKS } from "@/lib/db/mock-data";

export default function SearchPage() {
  const { currentUser, openCitation } = useKnowledge();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DocumentChunk[]>(MOCK_CHUNKS.slice(0, 4));
  const [loading, setLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults(MOCK_CHUNKS.slice(0, 4));
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: searchTerm,
        role: currentUser.role,
        department: currentUser.department,
        limit: "10",
      });
      const res = await fetch(`/api/search?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
      }
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      handleSearch(query);
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [query, currentUser.role, currentUser.department]);

  return (
    <div className="flex h-screen bg-transparent text-foreground overflow-hidden">
      <Sidebar
        isOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          title="Search & Sources"
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-4xl w-full mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-semibold tracking-[-0.03em] text-foreground">
              Knowledge Base Search
            </h1>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              Direct semantic and keyword passage search with permission filtering for{" "}
              <span className="font-semibold text-foreground">
                {currentUser.full_name} ({currentUser.role})
              </span>
              .
            </p>
          </div>

          {/* Search Box - Apple Spotlight Style */}
          <div className="relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search approved SOPs, pricing packages, policies, and FAQs..."
              className="w-full pl-10 pr-4 py-3 text-[14px] bg-white/70 dark:bg-black/60 backdrop-blur-3xl border border-black/8 dark:border-white/12 rounded-2xl placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 shadow-apple transition-colors"
              autoFocus
            />
          </div>

          {/* Role access notice */}
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-white/50 dark:bg-white/[0.04] backdrop-blur-md border border-black/8 dark:border-white/10 text-xs text-muted-foreground">
            <ShieldCheck className="w-4 h-4 text-foreground opacity-80 flex-shrink-0" />
            <span className="text-[12px]">
              Search automatically filters out confidential documents outside your department and role permissions.
            </span>
          </div>

          {/* Results List */}
          <div className="space-y-3">
            {loading ? (
              <div className="py-12 text-center text-xs text-muted-foreground">
                Searching verified passages...
              </div>
            ) : query.trim() && results.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground space-y-1">
                <p className="font-semibold text-foreground text-sm">No matching passages found</p>
                <p>Try searching with different terms or verify department permissions.</p>
              </div>
            ) : (
              results.map((chunk, idx) => {
                const citation: SourceCitation = {
                  citation_id: idx + 1,
                  document_id: chunk.document_id,
                  document_title: chunk.document_title,
                  category_name: chunk.category_name,
                  page_number: chunk.page_number,
                  section_title: chunk.section_title,
                  excerpt: chunk.content,
                  similarity_score: chunk.similarity || 0.88,
                };

                return (
                  <div
                    key={chunk.id}
                    onClick={() => openCitation(citation)}
                    className="p-4 rounded-2xl bg-white/60 dark:bg-white/[0.04] backdrop-blur-xl border border-black/8 dark:border-white/12 hover:border-foreground/35 hover:bg-white/80 dark:hover:bg-white/[0.08] hover:shadow-apple-hover transition-all cursor-pointer shadow-apple group"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-black/5 dark:bg-white/10 text-foreground text-xs font-mono font-medium flex items-center justify-center">
                          #{idx + 1}
                        </span>
                        <h3 className="text-[13.5px] font-semibold text-foreground group-hover:opacity-90 transition-opacity tracking-tight">
                          {chunk.document_title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
                        {chunk.similarity && (
                          <span className="px-2 py-0.5 rounded-full bg-surface-secondary border border-border">
                            {Math.round(chunk.similarity * 100)}% Match
                          </span>
                        )}
                        <span>
                          {chunk.page_number ? `Page ${chunk.page_number}` : "Section"}
                        </span>
                      </div>
                    </div>

                    <p className="text-[13.5px] text-foreground/90 font-serif leading-relaxed line-clamp-3">
                      “{chunk.content}”
                    </p>

                    <div className="mt-3.5 pt-2.5 border-t border-black/6 dark:border-white/10 flex items-center justify-between text-[11px] text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Tag className="w-3 h-3 opacity-60" />
                        <span>{chunk.category_name || "Company Documentation"}</span>
                        {chunk.section_title && (
                          <>
                            <span>•</span>
                            <span className="truncate max-w-[200px]">{chunk.section_title}</span>
                          </>
                        )}
                      </div>
                      <span className="inline-flex items-center gap-1 font-semibold text-foreground group-hover:translate-x-0.5 transition-transform">
                        <span>Inspect passage</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
