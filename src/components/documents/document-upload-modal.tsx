"use client";

import React, { useState, useRef } from "react";
import { useKnowledge } from "@/context/knowledge-context";
import { Upload, X, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Department, AccessScope } from "@/lib/types";
import { formatBytes } from "@/lib/utils";

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function DocumentUploadModal({ isOpen, onClose, onSuccess }: DocumentUploadModalProps) {
  const { currentUser } = useKnowledge();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("cat-sop");
  const [department, setDepartment] = useState<Department>("Engineering");
  const [accessScope, setAccessScope] = useState<AccessScope>("all");
  const [version, setVersion] = useState("1.0");

  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      selectFile(e.dataTransfer.files[0]);
    }
  };

  const selectFile = (selected: File) => {
    setError(null);
    setFile(selected);
    if (!title) {
      const name = selected.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
      setTitle(name.charAt(0).toUpperCase() + name.slice(1));
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a document file to upload.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(20);
    setError(null);
    setSuccessMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);
      formData.append("description", description);
      formData.append("category_id", categoryId);
      formData.append("department", department);
      formData.append("access_scope", accessScope);
      formData.append("version", version);
      formData.append("user_role", currentUser.role);

      setUploadProgress(50);

      const res = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      setUploadProgress(85);

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setUploadProgress(100);
      setSuccessMessage(data.message || `Indexed into ${data.chunks_indexed} chunks successfully!`);

      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to upload document");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 apple-blur animate-fade-in">
      <div 
        className="w-full max-w-lg bg-surface border border-black/8 dark:border-white/12 rounded-2xl shadow-popover overflow-hidden flex flex-col max-h-[90vh] animate-fade-in text-[13px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-black/2 dark:bg-white/2">
          <div>
            <h3 className="text-[14.5px] font-semibold text-foreground tracking-tight">Upload Company Document</h3>
            <p className="text-[11.5px] text-muted-foreground mt-0.5">
              Add verified documents with automatic chunking and instant vector indexing.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleUpload} className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-status-danger/10 text-status-danger border border-status-danger/20 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-status-success/10 text-status-success border border-status-success/20 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Drag & Drop File Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
              isDragging
                ? "border-foreground bg-black/5 dark:bg-white/10"
                : file
                ? "border-foreground/30 bg-surface-secondary"
                : "border-border hover:border-foreground/30 hover:bg-surface-hover"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt,.md,.csv"
              onChange={(e) => e.target.files?.[0] && selectFile(e.target.files[0])}
              className="hidden"
            />
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-black/6 dark:bg-white/12 text-foreground flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-foreground truncate max-w-[240px]">
                    {file.name}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {formatBytes(file.size)} • Click to choose a different file
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/10 text-foreground flex items-center justify-center mb-2 shadow-subtle">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="font-semibold text-foreground text-xs">
                  Click to select or drag and drop
                </div>
                <div className="text-[11px] text-muted-foreground mt-1">
                  PDF, DOCX, TXT, Markdown, CSV (up to 25MB)
                </div>
              </div>
            )}
          </div>

          {/* Title & Version */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                Document Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Employee Travel Policy 2025"
                className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-foreground focus:outline-none focus:border-foreground/40 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                Version
              </label>
              <input
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="1.0"
                className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-foreground focus:outline-none focus:border-foreground/40 text-xs"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of document content..."
              className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-foreground focus:outline-none focus:border-foreground/40 resize-none text-xs"
            />
          </div>

          {/* Category & Department */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-foreground focus:outline-none focus:border-foreground/40 text-xs"
              >
                <option value="cat-sop">Standard Operating Procedures</option>
                <option value="cat-pricing">Services and Pricing</option>
                <option value="cat-policies">Company Policies</option>
                <option value="cat-faq">Frequently Asked Questions</option>
                <option value="cat-hr">Human Resources</option>
                <option value="cat-admin">Executive & Compliance</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value as Department)}
                className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-foreground focus:outline-none focus:border-foreground/40 text-xs"
              >
                <option value="Engineering">Engineering</option>
                <option value="Sales">Sales</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
                <option value="Legal">Legal</option>
                <option value="Operations">Operations</option>
                <option value="Executive">Executive</option>
                <option value="General">General (All)</option>
              </select>
            </div>
          </div>

          {/* Access Scope */}
          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
              Access Scope
            </label>
            <select
              value={accessScope}
              onChange={(e) => setAccessScope(e.target.value as AccessScope)}
              className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-foreground focus:outline-none focus:border-foreground/40 text-xs"
            >
              <option value="all">All Authorized Employees</option>
              <option value="department">Specific Department Only</option>
              <option value="admin">Administrators Only (Confidential)</option>
            </select>
          </div>

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>Parsing and generating vector chunks...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-1.5 w-full bg-surface-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-foreground transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-border flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2 rounded-xl border border-border text-foreground hover:bg-surface-hover transition-colors font-medium text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!file || isUploading}
              className="px-4 py-2 rounded-xl bg-foreground text-background font-semibold hover:opacity-90 active:scale-95 transition-all shadow-apple flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed text-xs"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Upload & Index</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
