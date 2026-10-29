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
      // Auto-populate title without extension
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 apple-blur animate-fade-in">
      <div 
        className="w-full max-w-lg bg-surface border border-border rounded-2xl shadow-apple overflow-hidden flex flex-col max-h-[90vh] animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-secondary/40">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Upload Company Document</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Add verified documents to the knowledge base with automatic chunking and indexing.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleUpload} className="p-6 overflow-y-auto space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-lg bg-status-danger/10 text-status-danger border border-status-danger/20 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-lg bg-status-success/10 text-status-success border border-status-success/20 flex items-start gap-2">
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
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
              isDragging
                ? "border-accent bg-accent-subtle/50"
                : file
                ? "border-accent/40 bg-surface-secondary"
                : "border-border hover:border-accent/40 hover:bg-surface-hover"
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
                <div className="w-9 h-9 rounded-lg bg-accent-subtle text-accent flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-foreground truncate max-w-[240px]">
                    {file.name}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {formatBytes(file.size)} • Click to change file
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-accent-subtle text-accent flex items-center justify-center mb-2">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="font-semibold text-foreground">
                  Click to select or drag and drop
                </div>
                <div className="text-[11px] text-muted-foreground mt-1">
                  Supported formats: PDF, DOCX, TXT, Markdown, CSV (up to 25MB)
                </div>
              </div>
            )}
          </div>

          {/* Title & Version */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                Document Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Employee Travel Policy 2025"
                className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-foreground focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                Version
              </label>
              <input
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="1.0"
                className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-foreground focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-medium text-muted-foreground mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of what this document covers..."
              className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-foreground focus:outline-none focus:border-accent resize-none"
            />
          </div>

          {/* Category & Department */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-foreground focus:outline-none focus:border-accent"
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
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value as Department)}
                className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-foreground focus:outline-none focus:border-accent"
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

          {/* Access Scope (Permission Control) */}
          <div>
            <label className="block text-[11px] font-medium text-muted-foreground mb-1">
              Access Permission Scope
            </label>
            <select
              value={accessScope}
              onChange={(e) => setAccessScope(e.target.value as AccessScope)}
              className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-foreground focus:outline-none focus:border-accent"
            >
              <option value="all">All Authorized Employees</option>
              <option value="department">Specific Department Only</option>
              <option value="admin">Administrators Only (Confidential)</option>
            </select>
            <p className="text-[10px] text-muted-foreground mt-1">
              {accessScope === "admin"
                ? "Confidential: Employees will not be able to retrieve or view citations from this document."
                : accessScope === "department"
                ? `Restricted to members of the ${department} department.`
                : "Accessible across all company departments."}
            </p>
          </div>

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>Extracting text and generating embeddings...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-1.5 w-full bg-surface-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent transition-all duration-300"
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
              className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-surface-hover transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!file || isUploading}
              className="px-4 py-2 rounded-lg bg-accent text-accent-foreground font-medium hover:bg-accent-hover transition-colors shadow-subtle flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
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
