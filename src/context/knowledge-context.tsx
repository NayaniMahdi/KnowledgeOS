"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  AIProvider,
  Conversation,
  Department,
  SourceCitation,
  UserProfile,
  UserRole,
} from "@/lib/types";
import { MOCK_USERS } from "@/lib/db/mock-data";

interface KnowledgeContextType {
  // User & Role
  currentUser: UserProfile;
  switchUserRole: (role: UserRole) => void;
  setUserDepartment: (department: Department) => void;

  // Sidebar State (Desktop Collapsible)
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (val: boolean) => void;
  toggleSidebar: () => void;

  // Theme
  theme: "system" | "light" | "dark";
  setTheme: (theme: "system" | "light" | "dark") => void;

  // Demo Mode
  demoMode: boolean;
  setDemoMode: (val: boolean) => void;

  // Model & Provider Selection
  selectedProvider: AIProvider;
  setSelectedProvider: (provider: AIProvider) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;

  // Active Conversations
  conversations: Conversation[];
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  fetchConversations: () => Promise<void>;
  startNewConversation: () => void;
  createNewConversation: () => Promise<string>;
  deleteConversation: (id: string) => Promise<void>;
  clearAllConversations: () => Promise<void>;

  // Citation Inspector Drawer / Modal
  selectedCitation: SourceCitation | null;
  openCitation: (citation: SourceCitation) => void;
  closeCitation: () => void;

  // App Metadata
  appName: string;
  orgName: string;
}

const KnowledgeContext = createContext<KnowledgeContextType | undefined>(undefined);

export function KnowledgeProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile>(MOCK_USERS[0]); // Sarah Chen (Admin)
  const [isSidebarCollapsed, setIsSidebarCollapsedState] = useState<boolean>(false);
  const [theme, setThemeState] = useState<"system" | "light" | "dark">("dark");
  const [demoMode, setDemoModeState] = useState<boolean>(true);
  const [selectedProvider, setSelectedProviderState] = useState<AIProvider>("nvidia");
  const [selectedModel, setSelectedModelState] = useState<string>("nvidia/nemotron-3.5-bolt-e4b");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>("conv-demo-01");
  const [selectedCitation, setSelectedCitation] = useState<SourceCitation | null>(null);

  const appName = process.env.NEXT_PUBLIC_APP_NAME || "KnowledgeOS";
  const orgName = process.env.NEXT_PUBLIC_ORGANIZATION_NAME || "Acme Corp";

  const setSelectedModel = (model: string) => {
    setSelectedModelState(model);
    try {
      localStorage.setItem("kos_selected_model", model);
    } catch {}
  };

  const setSelectedProvider = (provider: AIProvider) => {
    setSelectedProviderState(provider);
    try {
      localStorage.setItem("kos_selected_provider", provider);
    } catch {}
  };

  // 1. Theme Management & Settings Persistence
  useEffect(() => {
    const savedTheme = localStorage.getItem("kos_theme") as "system" | "light" | "dark" | null;
    if (savedTheme) {
      setThemeState(savedTheme);
    } else {
      setThemeState("dark");
    }

    const savedModel = localStorage.getItem("kos_selected_model");
    if (savedModel && savedModel !== "nvidia/nemotron-3.5-lightning-30b-a3b") {
      setSelectedModelState(savedModel);
    } else {
      setSelectedModelState("nvidia/nemotron-3.5-bolt-e4b");
      try {
        localStorage.setItem("kos_selected_model", "nvidia/nemotron-3.5-bolt-e4b");
      } catch {}
    }

    const savedProvider = localStorage.getItem("kos_selected_provider") as AIProvider | null;
    if (savedProvider) {
      setSelectedProviderState(savedProvider);
    }

    const savedDemo = localStorage.getItem("kos_demo_mode");
    if (savedDemo !== null) {
      setDemoModeState(savedDemo === "true");
    }

    const savedCollapse = localStorage.getItem("kos_sidebar_collapsed");
    if (savedCollapse !== null) {
      setIsSidebarCollapsedState(savedCollapse === "true");
    }

    const savedRole = localStorage.getItem("kos_user_role") as UserRole | null;
    if (savedRole === "employee") {
      setCurrentUser(MOCK_USERS[1]); // Alex Rivera
    }
  }, []);

  const setIsSidebarCollapsed = (val: boolean) => {
    setIsSidebarCollapsedState(val);
    localStorage.setItem("kos_sidebar_collapsed", String(val));
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsedState((prev) => {
      const next = !prev;
      localStorage.setItem("kos_sidebar_collapsed", String(next));
      return next;
    });
  };

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      const isDark =
        theme === "dark" || (theme === "system" && mediaQuery.matches);
      if (isDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    };

    applyTheme();
    mediaQuery.addEventListener("change", applyTheme);
    return () => mediaQuery.removeEventListener("change", applyTheme);
  }, [theme]);

  const setTheme = (t: "system" | "light" | "dark") => {
    setThemeState(t);
    localStorage.setItem("kos_theme", t);
  };

  const setDemoMode = (val: boolean) => {
    setDemoModeState(val);
    localStorage.setItem("kos_demo_mode", String(val));
  };

  // 2. User & Role Switching
  const switchUserRole = (role: UserRole) => {
    const user = role === "admin" ? MOCK_USERS[0] : MOCK_USERS[1];
    setCurrentUser(user);
    localStorage.setItem("kos_user_role", role);
  };

  const setUserDepartment = (department: Department) => {
    setCurrentUser((prev) => ({ ...prev, department }));
  };

  // 3. Conversation Management
  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch (e) {
      console.error("Failed to load conversations:", e);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const startNewConversation = () => {
    setActiveConversationId(null);
  };

  const createNewConversation = async (): Promise<string> => {
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "New Conversation",
          model: selectedModel,
          provider: selectedProvider,
          is_demo: demoMode,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const newConv = data.conversation;
        setConversations((prev) => [newConv, ...prev]);
        setActiveConversationId(newConv.id);
        return newConv.id;
      }
    } catch (e) {
      console.error("Failed to create conversation:", e);
    }
    const fallbackId = `conv-${Date.now()}`;
    setActiveConversationId(fallbackId);
    return fallbackId;
  };

  const deleteConversation = async (id: string) => {
    try {
      await fetch(`/api/conversations/${id}`, { method: "DELETE" });
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConversationId === id) {
        setActiveConversationId(null);
      }
    } catch (e) {
      console.error("Failed to delete conversation:", e);
    }
  };

  const clearAllConversations = async () => {
    try {
      await fetch("/api/conversations", { method: "DELETE" });
      setConversations([]);
      setActiveConversationId(null);
    } catch (e) {
      console.error("Failed to clear conversations:", e);
    }
  };

  const openCitation = (citation: SourceCitation) => {
    setSelectedCitation(citation);
  };

  const closeCitation = () => {
    setSelectedCitation(null);
  };

  return (
    <KnowledgeContext.Provider
      value={{
        currentUser,
        switchUserRole,
        setUserDepartment,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        toggleSidebar,
        theme,
        setTheme,
        demoMode,
        setDemoMode,
        selectedProvider,
        setSelectedProvider,
        selectedModel,
        setSelectedModel,
        conversations,
        activeConversationId,
        setActiveConversationId,
        fetchConversations,
        startNewConversation,
        createNewConversation,
        deleteConversation,
        clearAllConversations,
        selectedCitation,
        openCitation,
        closeCitation,
        appName,
        orgName,
      }}
    >
      {children}
    </KnowledgeContext.Provider>
  );
}

export function useKnowledge() {
  const context = useContext(KnowledgeContext);
  if (!context) {
    throw new Error("useKnowledge must be used within a KnowledgeProvider");
  }
  return context;
}
