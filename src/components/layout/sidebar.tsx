"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useKnowledge } from "@/context/knowledge-context";
import { Logo } from "@/components/ui/logo";
import {
  MessageSquare,
  Plus,
  BookOpen,
  Search,
  Settings,
  Trash2,
  Laptop,
  Sun,
  Moon,
  Check,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ isOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    currentUser,
    switchUserRole,
    theme,
    setTheme,
    demoMode,
    conversations,
    activeConversationId,
    setActiveConversationId,
    startNewConversation,
    deleteConversation,
    clearAllConversations,
    isSidebarCollapsed,
  } = useKnowledge();

  const [searchConvQuery, setSearchConvQuery] = useState("");
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const handleNewConversation = () => {
    startNewConversation();
    if (pathname !== "/") {
      router.push("/");
    }
    if (onCloseMobile) onCloseMobile();
  };

  const handleSelectConversation = (convId: string) => {
    setActiveConversationId(convId);
    if (pathname !== "/") {
      router.push("/");
    }
    if (onCloseMobile) onCloseMobile();
  };

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchConvQuery.toLowerCase())
  );

  const navItems = [
    { label: "Assistant Chat", href: "/", icon: MessageSquare },
    { label: "Knowledge Base", href: "/documents", icon: BookOpen },
    { label: "Search & Sources", href: "/search", icon: Search },
    { label: "Settings & Admin", href: "/settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 z-40 md:hidden apple-blur"
        />
      )}

      {/* Apple-styled Collapsible Sidebar */}
      <aside
        className={cn(
          "fixed md:static inset-y-0 left-0 z-40 bg-white/80 dark:bg-black/70 apple-blur border-r border-black/8 dark:border-white/10 shadow-2xl flex flex-col transition-all duration-300 ease-in-out select-none text-[13.5px] overflow-hidden flex-shrink-0",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          isSidebarCollapsed ? "md:w-[68px] md:min-w-[68px] md:max-w-[68px] w-72" : "md:w-72 md:min-w-72 md:max-w-72 w-72"
        )}
      >
        {/* Brand Header: Single clean branding without duplicate collapse button */}
        {isSidebarCollapsed ? (
          /* Collapsed Desktop Header */
          <div className="h-14 flex items-center justify-center border-b border-black/8 dark:border-white/10 px-2">
            <Link href="/" title="KnowledgeOS Home" className="hover:opacity-80 transition-opacity">
              <Logo size="sm" showWordmark={false} />
            </Link>
          </div>
        ) : (
          /* Full Expanded Header */
          <div className="h-14 flex items-center justify-between px-4 border-b border-black/8 dark:border-white/10">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <Logo size="md" />
            </Link>

            {demoMode && (
              <span
                className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-foreground/80 border border-black/10 dark:border-white/10"
                title="Demo Mode: Sample enterprise documents loaded"
              >
                Demo
              </span>
            )}
          </div>
        )}

        {/* Action: New Chat */}
        <div className={cn("p-3", isSidebarCollapsed ? "flex justify-center" : "")}>
          {isSidebarCollapsed ? (
            <button
              onClick={handleNewConversation}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-foreground text-background font-medium hover:opacity-90 active:scale-[0.96] transition-all shadow-apple cursor-pointer"
              title="New Conversation"
              aria-label="New Conversation"
            >
              <Plus className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleNewConversation}
              className="w-full flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl bg-foreground text-background font-medium text-xs hover:opacity-90 active:scale-[0.98] transition-all shadow-apple cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Conversation</span>
            </button>
          )}
        </div>

        {/* Primary Navigation Links */}
        <nav className={cn("py-1", isSidebarCollapsed ? "px-2 space-y-1" : "px-2.5 space-y-0.5")}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            if (isSidebarCollapsed) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  title={item.label}
                  className={cn(
                    "w-10 h-10 mx-auto flex items-center justify-center rounded-xl transition-all",
                    isActive
                      ? "bg-black/10 dark:bg-white/15 text-foreground font-semibold shadow-subtle"
                      : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground"
                  )}
                >
                  <Icon className={cn("w-4 h-4", isActive ? "text-foreground" : "text-muted-foreground")} />
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors",
                  isActive
                    ? "bg-black/8 dark:bg-white/12 text-foreground font-semibold shadow-subtle"
                    : "text-muted-foreground hover:bg-black/4 dark:hover:bg-white/5 hover:text-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4",
                    isActive ? "text-foreground" : "text-muted-foreground"
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Recent Conversations Section (Hidden completely when sidebar is collapsed) */}
        {isSidebarCollapsed ? (
          <div className="flex-1" />
        ) : (
          /* Full Expanded Conversations Section */
          <>
            <div className="my-2 border-t border-black/8 dark:border-white/10 mx-3" />
            <div className="px-3.5 pt-1 pb-2 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Conversations
                </span>
                {conversations.length > 0 && (
                  <button
                    onClick={clearAllConversations}
                    className="text-[10px] text-muted-foreground hover:text-status-danger transition-colors cursor-pointer"
                    title="Clear all conversations"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={searchConvQuery}
                  onChange={(e) => setSearchConvQuery(e.target.value)}
                  placeholder="Search chats..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-black/[0.04] dark:bg-white/[0.06] rounded-xl placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-foreground/20 transition-all border-0"
                />
              </div>
            </div>

            {/* Conversations Scrollable List */}
            <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
              {filteredConversations.length === 0 ? (
                <div className="px-3 py-8 text-center text-xs text-muted-foreground">
                  No conversations yet
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isActive = activeConversationId === conv.id && pathname === "/";
                  return (
                    <div
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv.id)}
                      className={cn(
                        "group flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-colors",
                        isActive
                          ? "bg-black/8 dark:bg-white/12 text-foreground font-medium"
                          : "text-muted-foreground hover:bg-black/4 dark:hover:bg-white/5 hover:text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-1">
                        <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 opacity-70" />
                        <span className="truncate">{conv.title}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversation(conv.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:text-status-danger transition-opacity cursor-pointer"
                        title="Delete conversation"
                        aria-label="Delete conversation"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* Footer: Apple Minimal Borderless Dock */}
        {isSidebarCollapsed ? (
          /* Collapsed Rail Footer */
          <div className="p-2 border-t border-black/[0.04] dark:border-white/[0.06] flex flex-col items-center gap-2">
            {/* User Avatar */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="w-9 h-9 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold flex items-center justify-center text-xs shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
                title={`${currentUser.full_name} (${currentUser.role}) — Click to switch role`}
              >
                {currentUser.full_name[0]}
              </button>

              {/* Role Switcher Menu Popup */}
              {showRoleMenu && (
                <div className="absolute bottom-full mb-2 left-0 w-64 bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-3xl border border-black/[0.08] dark:border-white/[0.12] rounded-2xl shadow-popover p-1.5 z-50 animate-fade-in text-xs">
                  <div className="text-[10px] font-semibold text-muted-foreground uppercase px-2.5 py-1">
                    Switch Active Role
                  </div>
                  <button
                    onClick={() => {
                      switchUserRole("admin");
                      setShowRoleMenu(false);
                    }}
                    className={cn(
                      "w-full text-left p-2 rounded-xl flex items-center justify-between transition-colors cursor-pointer",
                      currentUser.role === "admin"
                        ? "bg-black/8 dark:bg-white/12 text-foreground font-semibold"
                        : "hover:bg-black/4 dark:hover:bg-white/5 text-foreground"
                    )}
                  >
                    <div>
                      <div className="font-semibold text-xs">Sarah Chen (Admin)</div>
                      <div className="text-[10px] text-muted-foreground">Executive • All documents</div>
                    </div>
                    {currentUser.role === "admin" && <Check className="w-3.5 h-3.5 text-foreground" />}
                  </button>
                  <button
                    onClick={() => {
                      switchUserRole("employee");
                      setShowRoleMenu(false);
                    }}
                    className={cn(
                      "w-full text-left p-2 rounded-xl flex items-center justify-between transition-colors cursor-pointer",
                      currentUser.role === "employee"
                        ? "bg-black/8 dark:bg-white/12 text-foreground font-semibold"
                        : "hover:bg-black/4 dark:hover:bg-white/5 text-foreground"
                    )}
                  >
                    <div>
                      <div className="font-semibold text-xs">Alex Rivera (Employee)</div>
                      <div className="text-[10px] text-muted-foreground">Engineering • Restricted</div>
                    </div>
                    {currentUser.role === "employee" && <Check className="w-3.5 h-3.5 text-foreground" />}
                  </button>
                </div>
              )}
            </div>

            {/* Quick Theme Cycle Button */}
            <button
              onClick={() => {
                if (theme === "dark") setTheme("light");
                else if (theme === "light") setTheme("system");
                else setTheme("dark");
              }}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] text-foreground transition-all cursor-pointer"
              title={`Theme: ${theme}. Click to switch.`}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Moon className="w-4 h-4 text-foreground" />
              ) : theme === "light" ? (
                <Sun className="w-4 h-4 text-foreground" />
              ) : (
                <Laptop className="w-4 h-4 text-foreground" />
              )}
            </button>
          </div>
        ) : (
          /* Full Expanded Footer: Minimal Borderless Apple Dock */
          <div className="p-3 pt-2 border-t border-black/[0.04] dark:border-white/[0.06] flex flex-col gap-2">
            {/* User Profile Tile - Borderless Minimal Apple Style */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.06] active:bg-black/[0.06] dark:active:bg-white/[0.09] transition-all text-left group cursor-pointer"
                title="Click to switch active role or department"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold flex items-center justify-center text-xs shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform">
                    {currentUser.full_name[0]}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-foreground tracking-tight truncate">
                      {currentUser.full_name}
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate">
                      {currentUser.department}
                    </div>
                  </div>
                </div>

                {/* Minimal Apple Role Pill (Borderless) */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="text-[10.5px] font-medium capitalize px-2 py-0.5 rounded-md bg-black/[0.04] dark:bg-white/[0.08] text-foreground/80">
                    {currentUser.role}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                </div>
              </button>

              {/* Role Switcher Menu Popup */}
              {showRoleMenu && (
                <div className="absolute bottom-full mb-2 left-0 w-full bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-3xl border border-black/[0.08] dark:border-white/[0.12] rounded-2xl shadow-popover p-1.5 z-50 animate-fade-in text-xs">
                  <div className="text-[10px] font-semibold text-muted-foreground uppercase px-2.5 py-1">
                    Switch Active Role
                  </div>
                  <button
                    onClick={() => {
                      switchUserRole("admin");
                      setShowRoleMenu(false);
                    }}
                    className={cn(
                      "w-full text-left p-2 rounded-xl flex items-center justify-between transition-colors cursor-pointer",
                      currentUser.role === "admin"
                        ? "bg-black/8 dark:bg-white/12 text-foreground font-semibold"
                        : "hover:bg-black/4 dark:hover:bg-white/5 text-foreground"
                    )}
                  >
                    <div>
                      <div className="font-semibold text-xs">Sarah Chen (Admin)</div>
                      <div className="text-[10px] text-muted-foreground">Executive • All documents</div>
                    </div>
                    {currentUser.role === "admin" && <Check className="w-3.5 h-3.5 text-foreground" />}
                  </button>
                  <button
                    onClick={() => {
                      switchUserRole("employee");
                      setShowRoleMenu(false);
                    }}
                    className={cn(
                      "w-full text-left p-2 rounded-xl flex items-center justify-between transition-colors cursor-pointer",
                      currentUser.role === "employee"
                        ? "bg-black/8 dark:bg-white/12 text-foreground font-semibold"
                        : "hover:bg-black/4 dark:hover:bg-white/5 text-foreground"
                    )}
                  >
                    <div>
                      <div className="font-semibold text-xs">Alex Rivera (Employee)</div>
                      <div className="text-[10px] text-muted-foreground">Engineering • Restricted</div>
                    </div>
                    {currentUser.role === "employee" && <Check className="w-3.5 h-3.5 text-foreground" />}
                  </button>
                </div>
              )}
            </div>

            {/* Apple Segmented Theme Switcher - 100% Borderless Native Pill Dock */}
            <div className="grid grid-cols-3 p-1 rounded-xl bg-black/[0.04] dark:bg-white/[0.06]">
              <button
                onClick={() => setTheme("light")}
                className={cn(
                  "flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition-all select-none cursor-pointer",
                  theme === "light"
                    ? "bg-white text-neutral-900 shadow-sm font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="Light Theme"
              >
                <Sun className="w-3.5 h-3.5" />
                <span className="text-[11px]">Light</span>
              </button>

              <button
                onClick={() => setTheme("dark")}
                className={cn(
                  "flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition-all select-none cursor-pointer",
                  theme === "dark"
                    ? "bg-white/20 text-white shadow-sm font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="Dark Theme"
              >
                <Moon className="w-3.5 h-3.5" />
                <span className="text-[11px]">Dark</span>
              </button>

              <button
                onClick={() => setTheme("system")}
                className={cn(
                  "flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition-all select-none cursor-pointer",
                  theme === "system"
                    ? "bg-white dark:bg-white/20 text-foreground shadow-sm font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="System Theme"
              >
                <Laptop className="w-3.5 h-3.5" />
                <span className="text-[11px]">Auto</span>
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
