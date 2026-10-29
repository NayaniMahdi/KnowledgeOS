"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { DocumentUploadModal } from "@/components/documents/document-upload-modal";
import { useKnowledge } from "@/context/knowledge-context";
import { DocumentItem, DocumentChunk, DocumentCategory } from "@/lib/types";
import { formatBytes, formatDate } from "@/lib/utils";
import {
  Upload,
  Search,
  FileText,
  Trash2,
  RefreshCw,
  Eye,
  Shield,
  Tag,
  CheckCircle2,
  AlertCircle,
  Layers,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function DocumentsPage() {
  const { currentUser } = useKnowledge();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Chunk inspection drawer state
  const [inspectingDoc, setInspectingDoc] = useState<DocumentItem | null>(null);
  const [docChunks, setDocChunks] = useState<DocumentChunk[]>([]);
  const [loadingChunks, setLoadingChunks] = useState(false);

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (selectedCategory !== "all") params.set("category", selectedCategory);
      params.set("role", currentUser.role);
      params.set("department", currentUser.department);

      const res = await fetch(`/api/documents?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error("Failed to load documents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [selectedCategory, searchQuery, currentUser.role, currentUser.department]);

  const handleDelete = async (docId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? All indexed chunks will be purged.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/documents/${docId}`, {
        method: "DELETE",
        headers: { "x-user-role": currentUser.role },
      });
      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== docId));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete document");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleReprocess = async (docId: string) => {
    try {
      const res = await fetch(`/api/documents/${docId}/reprocess`, {
        method: "POST",
      });
      if (res.ok) {
        alert("Document chunks successfully reprocessed and indexed!");
        fetchDocs();
      }
    } catch (err) {
      console.error("Reprocess error:", err);
    }
  };

  const openChunkInspector = async (doc: DocumentItem) => {
    setInspectingDoc(doc);
    setLoadingChunks(true);
    try {
      const res = await fetch(`/api/documents/${doc.id}`);
      if (res.ok) {
        const data = await res.json();
        setDocChunks(data.chunks || []);
      }
    } catch (err) {
      console.error("Failed to load chunks:", err);
    } finally {
      setLoadingChunks(false);
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar
        isOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          title="Knowledge Base"
        />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-6xl w-full mx-auto space-y-6">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                Company Knowledge Base
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Manage approved documents, review indexed chunks, and configure department access boundaries.
              </p>
            </div>

            {currentUser.role === "admin" ? (
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-accent-foreground text-xs font-medium hover:bg-accent-hover transition-colors shadow-subtle flex-shrink-0"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Document</span>
              </button>
            ) : (
              <div className="text-xs text-muted-foreground px-3 py-1.5 rounded-lg bg-surface-secondary border border-border">
                Employee View (Read-Only)
              </div>
            )}
          </div>

          {/* Search & Category Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documents by title, description, or filename..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-surface border border-border rounded-xl placeholder:text-muted-foreground focus:outline-none focus:border-accent shadow-subtle"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
              <button
                onClick={() => setSelectedCategory("all")}
                className={cn(
                  "px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap",
                  selectedCategory === "all"
                    ? "bg-accent-subtle text-accent font-semibold"
                    : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                )}
              >
                All Documents ({documents.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap",
                    selectedCategory === cat.id
                      ? "bg-accent-subtle text-accent font-semibold"
                      : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                  )}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Documents Table / Grid */}
          <div className="bg-surface border border-border rounded-2xl shadow-subtle overflow-hidden">
            {loading ? (
              <div className="py-16 text-center text-xs text-muted-foreground">
                Loading knowledge base documents...
              </div>
            ) : documents.length === 0 ? (
              <div className="py-16 text-center text-xs text-muted-foreground space-y-2">
                <FileText className="w-8 h-8 text-muted-foreground mx-auto opacity-50" />
                <p className="font-medium text-foreground">No documents found.</p>
                <p>Try clearing your filters or upload a new company document.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-border bg-surface-secondary/40 text-muted-foreground font-semibold">
                      <th className="py-3 px-4">Document Title</th>
                      <th className="py-3 px-3">Category</th>
                      <th className="py-3 px-3">Department</th>
                      <th className="py-3 px-3">Access Scope</th>
                      <th className="py-3 px-3">Chunks</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {documents.map((doc) => (
                      <tr
                        key={doc.id}
                        className="hover:bg-surface-hover/50 transition-colors group"
                      >
                        {/* Title & File Info */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-accent-subtle text-accent flex items-center justify-center flex-shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-foreground truncate max-w-[220px] sm:max-w-[280px]">
                                {doc.title}
                              </div>
                              <div className="text-[11px] text-muted-foreground truncate">
                                {doc.file_name} • {formatBytes(doc.file_size_bytes)} • v{doc.version}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-secondary text-foreground text-[11px] font-medium border border-border">
                            <Tag className="w-3 h-3 text-accent" />
                            {doc.category_name || "General"}
                          </span>
                        </td>

                        {/* Department */}
                        <td className="py-3 px-3 font-medium text-foreground">
                          {doc.department}
                        </td>

                        {/* Access Scope */}
                        <td className="py-3 px-3">
                          {doc.access_scope === "admin" ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-status-danger bg-status-danger/10 px-2 py-0.5 rounded-full border border-status-danger/20">
                              <Shield className="w-3 h-3" />
                              Admin Only
                            </span>
                          ) : doc.access_scope === "department" ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-status-warning bg-status-warning/10 px-2 py-0.5 rounded-full border border-status-warning/20">
                              <Shield className="w-3 h-3" />
                              {doc.department} Only
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-status-success bg-status-success/10 px-2 py-0.5 rounded-full border border-status-success/20">
                              <CheckCircle2 className="w-3 h-3" />
                              All Employees
                            </span>
                          )}
                        </td>

                        {/* Chunk Count */}
                        <td className="py-3 px-3 font-mono text-[11px]">
                          {doc.chunk_count} passages
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-status-success/10 text-status-success border border-status-success/20">
                            <CheckCircle2 className="w-3 h-3" />
                            Indexed
                          </span>
                        </td>

                        {/* Action Buttons */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openChunkInspector(doc)}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-secondary transition-colors"
                              title="Inspect indexed chunks"
                            >
                              <Layers className="w-4 h-4" />
                            </button>

                            {currentUser.role === "admin" && (
                              <>
                                <button
                                  onClick={() => handleReprocess(doc.id)}
                                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-secondary transition-colors"
                                  title="Reprocess and re-embed chunks"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(doc.id, doc.title)}
                                  className="p-1.5 rounded-lg text-muted-foreground hover:text-status-danger hover:bg-surface-secondary transition-colors"
                                  title="Delete document and purge chunks"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Chunk Inspector Slide-over / Modal */}
      {inspectingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 apple-blur animate-fade-in">
          <div className="w-full max-w-2xl bg-surface border border-border rounded-2xl shadow-apple overflow-hidden flex flex-col max-h-[85vh] animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-secondary/40">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent-subtle text-accent flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Indexed Chunks: {inspectingDoc.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {docChunks.length} searchable vector passages generated with location metadata.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectingDoc(null)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-hover"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chunks List */}
            <div className="p-6 overflow-y-auto space-y-3 text-xs">
              {loadingChunks ? (
                <div className="py-8 text-center text-muted-foreground">
                  Loading passages...
                </div>
              ) : docChunks.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  No chunks generated for this document.
                </div>
              ) : (
                docChunks.map((chunk, index) => (
                  <div
                    key={chunk.id}
                    className="p-3.5 rounded-xl bg-surface-secondary border border-border space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        Chunk #{index + 1}
                      </span>
                      <span>
                        {chunk.page_number ? `Page ${chunk.page_number}` : ""}
                        {chunk.section_title ? ` • ${chunk.section_title}` : ""}
                      </span>
                    </div>
                    <div className="font-serif text-foreground text-[13px] leading-relaxed">
                      {chunk.content}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-border bg-surface-secondary/20 flex justify-end">
              <button
                onClick={() => setInspectingDoc(null)}
                className="px-4 py-1.5 rounded-lg bg-accent text-accent-foreground text-xs font-medium hover:bg-accent-hover transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={fetchDocs}
      />
    </div>
  );
}
