"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useKnowledge } from "@/context/knowledge-context";
import { DocumentChunk, SourceCitation } from "@/lib/types";
import { Search, FileText, ArrowRight, ShieldCheck, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SearchPage() {
  const { currentUser, openCitation } = useKnowledge();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DocumentChunk[]>([]);
  const [loading, setLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults([]);
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
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar
        isOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          title="Search & Sources"
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-4xl w-full mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Knowledge Base Search
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Direct semantic and keyword passage search with permission filtering for{" "}
              <span className="font-semibold text-foreground">
                {currentUser.full_name} ({currentUser.role})
              </span>
              .
            </p>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search across all approved SOPs, pricing schedules, policies, and FAQs..."
              className="w-full pl-10 pr-4 py-3 text-sm bg-surface border border-border rounded-xl placeholder:text-muted-foreground focus:outline-none focus:border-accent shadow-subtle"
              autoFocus
            />
          </div>

          {/* Role access notice */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-surface-secondary/70 border border-border text-xs text-muted-foreground">
            <ShieldCheck className="w-4 h-4 text-accent flex-shrink-0" />
            <span>
              Search results automatically exclude confidential documents outside your department or role access scope.
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
                <p className="font-medium text-foreground">No matching passages found.</p>
                <p>Try using different keywords or check if the document is restricted to another department.</p>
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
                    className="p-4 rounded-xl bg-surface border border-border hover:border-accent/40 hover:bg-surface-hover/60 transition-all cursor-pointer shadow-subtle group"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded bg-accent-subtle text-accent text-xs font-mono font-medium flex items-center justify-center">
                          #{idx + 1}
                        </span>
                        <h3 className="text-xs font-semibold text-foreground group-hover:text-accent transition-colors">
                          {chunk.document_title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
                        {chunk.similarity && (
                          <span className="px-1.5 py-0.5 rounded bg-surface-secondary border border-border">
                            {Math.round(chunk.similarity * 100)}% Match
                          </span>
                        )}
                        <span>
                          {chunk.page_number ? `Page ${chunk.page_number}` : "Section"}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-foreground/90 font-serif leading-relaxed line-clamp-3">
                      “{chunk.content}”
                    </p>

                    <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Tag className="w-3 h-3 text-accent" />
                        <span>{chunk.category_name || "Company Documentation"}</span>
                        {chunk.section_title && (
                          <>
                            <span>•</span>
                            <span className="truncate max-w-[200px]">{chunk.section_title}</span>
                          </>
                        )}
                      </div>
                      <span className="inline-flex items-center gap-1 text-accent font-medium group-hover:translate-x-0.5 transition-transform">
                        <span>View source passage</span>
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
