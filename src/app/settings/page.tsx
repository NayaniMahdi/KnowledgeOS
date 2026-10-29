"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useKnowledge } from "@/context/knowledge-context";
import { AIProvider } from "@/lib/types";
import { SUPPORTED_MODELS } from "@/lib/ai/models";
import { MOCK_USERS } from "@/lib/db/mock-data";
import {
  Sliders,
  Cpu,
  BookOpen,
  Users,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Shield,
  Laptop,
  Sun,
  Moon,
  ExternalLink,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

type TabId = "general" | "ai" | "knowledge" | "users" | "usage";

export default function SettingsPage() {
  const {
    theme,
    setTheme,
    demoMode,
    setDemoMode,
    selectedProvider,
    setSelectedProvider,
    selectedModel,
    setSelectedModel,
    currentUser,
    switchUserRole,
    appName,
    orgName,
  } = useKnowledge();

  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // AI Settings state
  const [nvidiaKey, setNvidiaKey] = useState("");
  const [openrouterKey, setOpenrouterKey] = useState("");
  const [testingProvider, setTestingProvider] = useState<AIProvider | null>(null);
  const [testResult, setTestResult] = useState<{
    provider: AIProvider;
    success: boolean;
    latency_ms: number;
    model_tested: string;
    error?: string;
  } | null>(null);

  // Stats state
  const [stats, setStats] = useState<{
    documents_count: number;
    chunks_count: number;
    conversations_count: number;
    audit_events_count: number;
    has_nvidia_key: boolean;
    has_openrouter_key: boolean;
    recent_audits: Array<{
      id: string;
      timestamp: string;
      user_name: string;
      action: string;
      details: string;
    }>;
  } | null>(null);

  // Invite modal state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to load stats:", err);
      }
    };
    fetchStats();
  }, [activeTab]);

  const handleTestConnection = async (provider: AIProvider) => {
    setTestingProvider(provider);
    setTestResult(null);

    const customKey = provider === "nvidia" ? nvidiaKey : openrouterKey;

    try {
      const res = await fetch("/api/settings/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          customApiKey: customKey.trim() || undefined,
        }),
      });

      const data = await res.json();
      setTestResult({
        provider,
        success: data.success,
        latency_ms: data.latency_ms,
        model_tested: data.model_tested,
        error: data.error,
      });
    } catch (err: any) {
      setTestResult({
        provider,
        success: false,
        latency_ms: 0,
        model_tested: "unknown",
        error: err.message || "Failed to contact connection test API",
      });
    } finally {
      setTestingProvider(null);
    }
  };

  const handleInviteUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setInviteSuccess(true);
    setInviteEmail("");
    setTimeout(() => setInviteSuccess(false), 3000);
  };

  const tabs = [
    { id: "general", label: "General", icon: Sliders },
    { id: "ai", label: "AI Models & Providers", icon: Cpu },
    { id: "knowledge", label: "Knowledge Base", icon: BookOpen },
    { id: "users", label: "Users & Permissions", icon: Users },
    { id: "usage", label: "Usage & Audit Logs", icon: BarChart3 },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar
        isOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          title="Settings & Administration"
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-5xl w-full mx-auto space-y-6">
          {/* Header */}
          <div className="pb-2 border-b border-border">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Application Settings
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Configure AI providers, enterprise knowledge chunking, user roles, and security policies.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto border-b border-border pb-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabId)}
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap",
                    isActive
                      ? "bg-accent-subtle text-accent font-semibold"
                      : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab 1: General */}
          {activeTab === "general" && (
            <div className="space-y-6 animate-fade-in text-xs">
              {/* Application Details Card */}
              <div className="p-5 rounded-2xl bg-surface border border-border shadow-subtle space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Organization & Branding</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      Product Name
                    </label>
                    <input
                      type="text"
                      defaultValue={appName}
                      className="w-full px-3 py-2 rounded-lg bg-surface-secondary border border-border text-foreground focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      Organization Name
                    </label>
                    <input
                      type="text"
                      defaultValue={orgName}
                      className="w-full px-3 py-2 rounded-lg bg-surface-secondary border border-border text-foreground focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>
              </div>

              {/* Appearance Mode */}
              <div className="p-5 rounded-2xl bg-surface border border-border shadow-subtle space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Appearance Theme</h3>
                <p className="text-muted-foreground">
                  System mode dynamically follows your device’s light/dark setting.
                </p>
                <div className="grid grid-cols-3 gap-3 max-w-md">
                  <button
                    onClick={() => setTheme("system")}
                    className={cn(
                      "p-3 rounded-xl border flex flex-col items-center gap-2 transition-all shadow-subtle",
                      theme === "system"
                        ? "border-accent bg-accent-subtle text-accent font-semibold"
                        : "border-border bg-surface text-foreground hover:bg-surface-hover"
                    )}
                  >
                    <Laptop className="w-4 h-4" />
                    <span>System (Default)</span>
                  </button>
                  <button
                    onClick={() => setTheme("light")}
                    className={cn(
                      "p-3 rounded-xl border flex flex-col items-center gap-2 transition-all shadow-subtle",
                      theme === "light"
                        ? "border-accent bg-accent-subtle text-accent font-semibold"
                        : "border-border bg-surface text-foreground hover:bg-surface-hover"
                    )}
                  >
                    <Sun className="w-4 h-4" />
                    <span>Light</span>
                  </button>
                  <button
                    onClick={() => setTheme("dark")}
                    className={cn(
                      "p-3 rounded-xl border flex flex-col items-center gap-2 transition-all shadow-subtle",
                      theme === "dark"
                        ? "border-accent bg-accent-subtle text-accent font-semibold"
                        : "border-border bg-surface text-foreground hover:bg-surface-hover"
                    )}
                  >
                    <Moon className="w-4 h-4" />
                    <span>Dark</span>
                  </button>
                </div>
              </div>

              {/* Demo Mode Toggle Card */}
              <div className="p-5 rounded-2xl bg-surface border border-border shadow-subtle flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <span>Demo Mode</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent-subtle text-accent font-mono">
                      {demoMode ? "Active" : "Disabled"}
                    </span>
                  </h3>
                  <p className="text-muted-foreground mt-1 max-w-xl leading-relaxed">
                    When enabled, KnowledgeOS seeds sample SOPs, pricing schedules, and HR documents so you can immediately test RAG citations and chat without requiring live company credentials. Switching to production isolates all demo data.
                  </p>
                </div>
                <button
                  onClick={() => setDemoMode(!demoMode)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex-shrink-0 shadow-subtle",
                    demoMode
                      ? "bg-accent text-accent-foreground hover:bg-accent-hover"
                      : "bg-surface-secondary text-foreground hover:bg-surface-hover border border-border"
                  )}
                >
                  {demoMode ? "Disable Demo Mode" : "Enable Demo Mode"}
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: AI Models & Providers */}
          {activeTab === "ai" && (
            <div className="space-y-6 animate-fade-in text-xs">
              {/* Test Result Alert */}
              {testResult && (
                <div
                  className={cn(
                    "p-4 rounded-xl border flex items-start gap-3",
                    testResult.success
                      ? "bg-status-success/10 text-status-success border-status-success/20"
                      : "bg-status-danger/10 text-status-danger border-status-danger/20"
                  )}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h4 className="font-semibold text-sm">
                      {testResult.success
                        ? `Connected to ${testResult.provider.toUpperCase()} Successfully`
                        : `Failed to Connect to ${testResult.provider.toUpperCase()}`}
                    </h4>
                    <p className="mt-0.5 text-xs opacity-90">
                      {testResult.success
                        ? `Verified test ping with ${testResult.model_tested} in ${testResult.latency_ms}ms.`
                        : testResult.error}
                    </p>
                  </div>
                </div>
              )}

              {/* Provider Selection Card */}
              <div className="p-5 rounded-2xl bg-surface border border-border shadow-subtle space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Active LLM Provider</h3>
                  <span className="text-muted-foreground text-[11px]">
                    Official API Endpoints Supported
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* OpenRouter Provider */}
                  <div
                    onClick={() => setSelectedProvider("openrouter")}
                    className={cn(
                      "p-4 rounded-xl border cursor-pointer transition-all shadow-subtle flex flex-col justify-between",
                      selectedProvider === "openrouter"
                        ? "border-accent bg-accent-subtle/50 text-foreground"
                        : "border-border bg-surface hover:bg-surface-hover"
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm">OpenRouter</span>
                        {selectedProvider === "openrouter" && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent text-accent-foreground font-medium">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground mt-1">
                        Frontier models including Gemini 2.0 Flash, Llama 3.3 70B, and DeepSeek R1 (with free tier support).
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground">openrouter.ai/api/v1</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTestConnection("openrouter");
                        }}
                        disabled={testingProvider === "openrouter"}
                        className="px-2.5 py-1 rounded-lg bg-surface border border-border hover:bg-surface-secondary transition-colors font-medium flex items-center gap-1 shadow-subtle"
                      >
                        {testingProvider === "openrouter" ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Zap className="w-3 h-3 text-accent" />
                        )}
                        <span>Test Connection</span>
                      </button>
                    </div>
                  </div>

                  {/* NVIDIA Provider */}
                  <div
                    onClick={() => setSelectedProvider("nvidia")}
                    className={cn(
                      "p-4 rounded-xl border cursor-pointer transition-all shadow-subtle flex flex-col justify-between",
                      selectedProvider === "nvidia"
                        ? "border-accent bg-accent-subtle/50 text-foreground"
                        : "border-border bg-surface hover:bg-surface-hover"
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm">NVIDIA Hosted Models</span>
                        {selectedProvider === "nvidia" && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent text-accent-foreground font-medium">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground mt-1">
                        Enterprise inference hosted on NVIDIA HGX infrastructure with TensorRT-LLM acceleration.
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground">integrate.api.nvidia.com/v1</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTestConnection("nvidia");
                        }}
                        disabled={testingProvider === "nvidia"}
                        className="px-2.5 py-1 rounded-lg bg-surface border border-border hover:bg-surface-secondary transition-colors font-medium flex items-center gap-1 shadow-subtle"
                      >
                        {testingProvider === "nvidia" ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Zap className="w-3 h-3 text-accent" />
                        )}
                        <span>Test Connection</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* API Keys Configuration */}
              <div className="p-5 rounded-2xl bg-surface border border-border shadow-subtle space-y-4">
                <h3 className="text-sm font-semibold text-foreground">API Credentials</h3>
                <p className="text-muted-foreground">
                  Credentials are encrypted and never exposed in browser bundles or client-side storage. For production deployments, configure these in Vercel environment variables.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      OpenRouter API Key
                    </label>
                    <input
                      type="password"
                      value={openrouterKey}
                      onChange={(e) => setOpenrouterKey(e.target.value)}
                      placeholder="sk-or-v1-••••••••••••••••"
                      className="w-full px-3 py-2 rounded-lg bg-surface-secondary border border-border text-foreground font-mono focus:outline-none focus:border-accent"
                    />
                    <span className="text-[10px] text-muted-foreground mt-1 block">
                      Obtain from <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" className="text-accent underline">openrouter.ai/keys</a>
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      NVIDIA API Key
                    </label>
                    <input
                      type="password"
                      value={nvidiaKey}
                      onChange={(e) => setNvidiaKey(e.target.value)}
                      placeholder="nvapi-••••••••••••••••"
                      className="w-full px-3 py-2 rounded-lg bg-surface-secondary border border-border text-foreground font-mono focus:outline-none focus:border-accent"
                    />
                    <span className="text-[10px] text-muted-foreground mt-1 block">
                      Obtain from <a href="https://build.nvidia.com/" target="_blank" rel="noreferrer" className="text-accent underline">build.nvidia.com</a>
                    </span>
                  </div>
                </div>
              </div>

              {/* Model Selection Dropdown */}
              <div className="p-5 rounded-2xl bg-surface border border-border shadow-subtle space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Default Model Catalog</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      Primary Model
                    </label>
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-foreground focus:outline-none focus:border-accent"
                    >
                      {SUPPORTED_MODELS.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.provider}) {m.is_free ? "• Free" : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      Embedding Model
                    </label>
                    <select
                      defaultValue="text-embedding-3-small"
                      className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-foreground focus:outline-none focus:border-accent"
                    >
                      <option value="text-embedding-3-small">text-embedding-3-small (1536 dims)</option>
                      <option value="nvidia/llama-3.2-nv-embedqa-1b-v2">NVIDIA NV-EmbedQA (1024 dims)</option>
                      <option value="baai/bge-m3">BAAI BGE-M3 Multilingual</option>
                      <option value="built-in-bm25">Built-in Hybrid Cosine (Offline)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Knowledge Base Settings */}
          {activeTab === "knowledge" && (
            <div className="space-y-6 animate-fade-in text-xs">
              <div className="p-5 rounded-2xl bg-surface border border-border shadow-subtle space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Chunking & Vector Settings</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      Chunk Size (Characters)
                    </label>
                    <input
                      type="number"
                      defaultValue={800}
                      className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-foreground focus:outline-none focus:border-accent"
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Target length for passage extraction (~200-250 words).
                    </p>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      Chunk Overlap (Characters)
                    </label>
                    <input
                      type="number"
                      defaultValue={150}
                      className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-foreground focus:outline-none focus:border-accent"
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Preserves cross-boundary sentence context.
                    </p>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      Top K Retrieved Passages
                    </label>
                    <input
                      type="number"
                      defaultValue={5}
                      className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-foreground focus:outline-none focus:border-accent"
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Maximum number of chunks sent in LLM context.
                    </p>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      Similarity Cutoff Threshold
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      defaultValue={0.35}
                      className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-foreground focus:outline-none focus:border-accent"
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Queries below this score trigger the "Missing Information" response.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Users & Permissions */}
          {activeTab === "users" && (
            <div className="space-y-6 animate-fade-in text-xs">
              {/* User List */}
              <div className="p-5 rounded-2xl bg-surface border border-border shadow-subtle space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Team Members & Roles</h3>
                  <span className="text-muted-foreground">
                    Role determines document access scope
                  </span>
                </div>

                <div className="divide-y divide-border/60">
                  {MOCK_USERS.map((usr) => (
                    <div
                      key={usr.id}
                      className="py-3 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-accent-subtle text-accent font-semibold flex items-center justify-center text-xs">
                          {usr.full_name[0]}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">
                            {usr.full_name}
                            {currentUser.id === usr.id && (
                              <span className="ml-2 text-[10px] px-1.5 py-0.2 rounded bg-surface-secondary text-muted-foreground font-normal border border-border">
                                Active Session
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            {usr.email} • {usr.department}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-full text-[11px] font-medium border",
                            usr.role === "admin"
                              ? "bg-accent-subtle text-accent border-accent/20"
                              : "bg-surface-secondary text-foreground border-border"
                          )}
                        >
                          {usr.role === "admin" ? "Administrator" : "Employee"}
                        </span>
                        <button
                          onClick={() => switchUserRole(usr.role)}
                          className="px-3 py-1 rounded-lg border border-border hover:bg-surface-secondary transition-colors text-[11px]"
                        >
                          Switch to User
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Invite User Form */}
              <div className="p-5 rounded-2xl bg-surface border border-border shadow-subtle space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Invite New Team Member</h3>
                {inviteSuccess && (
                  <div className="p-2.5 rounded-lg bg-status-success/10 text-status-success border border-status-success/20">
                    Invitation sent successfully!
                  </div>
                )}
                <form onSubmit={handleInviteUser} className="flex gap-2 max-w-md">
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@acme.corp"
                    className="flex-1 px-3 py-2 rounded-lg bg-surface-secondary border border-border text-foreground focus:outline-none focus:border-accent text-xs"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-accent text-accent-foreground font-medium hover:bg-accent-hover transition-colors shadow-subtle"
                  >
                    Send Invite
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Tab 5: Usage & Audit Logs */}
          {activeTab === "usage" && (
            <div className="space-y-6 animate-fade-in text-xs">
              {/* Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl bg-surface border border-border shadow-subtle">
                  <span className="text-muted-foreground block mb-1">Indexed Documents</span>
                  <span className="text-xl font-bold text-foreground font-mono">
                    {stats?.documents_count ?? 0}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-surface border border-border shadow-subtle">
                  <span className="text-muted-foreground block mb-1">Vector Chunks</span>
                  <span className="text-xl font-bold text-foreground font-mono">
                    {stats?.chunks_count ?? 0}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-surface border border-border shadow-subtle">
                  <span className="text-muted-foreground block mb-1">Active Conversations</span>
                  <span className="text-xl font-bold text-foreground font-mono">
                    {stats?.conversations_count ?? 0}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-surface border border-border shadow-subtle">
                  <span className="text-muted-foreground block mb-1">Audit Events</span>
                  <span className="text-xl font-bold text-foreground font-mono">
                    {stats?.audit_events_count ?? 0}
                  </span>
                </div>
              </div>

              {/* Audit Events Log */}
              <div className="p-5 rounded-2xl bg-surface border border-border shadow-subtle space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Recent Security & Audit Events</h3>
                <div className="divide-y divide-border/60">
                  {stats?.recent_audits.map((evt) => (
                    <div key={evt.id} className="py-2.5 flex items-start justify-between gap-4">
                      <div>
                        <div className="font-semibold text-foreground flex items-center gap-2">
                          <span>{evt.action}</span>
                          <span className="text-[10px] text-muted-foreground font-normal">
                            by {evt.user_name}
                          </span>
                        </div>
                        <div className="text-muted-foreground mt-0.5">
                          {evt.details}
                        </div>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono whitespace-nowrap">
                        {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
