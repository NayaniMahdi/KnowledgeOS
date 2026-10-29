"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useKnowledge } from "@/context/knowledge-context";
import { Logo } from "@/components/ui/logo";
import {
  MessageSquare,
  Plus,
  BookOpen,
  Search,
  Settings,
  Trash2,
  Shield,
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
  const {
    currentUser,
    switchUserRole,
    theme,
    setTheme,
    demoMode,
    conversations,
    activeConversationId,
    setActiveConversationId,
    createNewConversation,
    deleteConversation,
    clearAllConversations,
  } = useKnowledge();

  const [searchConvQuery, setSearchConvQuery] = useState("");
  const [showRoleMenu, setShowRoleMenu] = useState(false);

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

      {/* Apple-styled Sidebar */}
      <aside
        className={cn(
          "fixed md:static inset-y-0 left-0 z-40 w-72 bg-[#FBFBFD] dark:bg-[#0A0A0C] border-r border-black/5 dark:border-white/10 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 select-none text-[13.5px]",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-black/5 dark:border-white/10">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <Logo size="md" />
          </Link>

          {/* Demo Mode Badge */}
          {demoMode && (
            <span
              className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-foreground/80 border border-black/10 dark:border-white/10"
              title="Demo Mode: Sample enterprise documents loaded"
            >
              Demo
            </span>
          )}
        </div>

        {/* Action: New Chat (Apple Pill Button) */}
        <div className="p-3">
          <button
            onClick={() => {
              createNewConversation();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl bg-foreground text-background font-medium text-xs hover:opacity-90 active:scale-[0.98] transition-all shadow-apple"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Conversation</span>
          </button>
        </div>

        {/* Primary Navigation Links */}
        <nav className="px-2.5 py-1 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
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

        {/* Separator */}
        <div className="my-2 border-t border-black/5 dark:border-white/10 mx-3" />

        {/* Recent Conversations Section */}
        <div className="px-3.5 pt-1 pb-2 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Conversations
            </span>
            {conversations.length > 0 && (
              <button
                onClick={clearAllConversations}
                className="text-[10px] text-muted-foreground hover:text-status-danger transition-colors"
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
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-black/4 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 transition-colors"
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
                  onClick={() => {
                    setActiveConversationId(conv.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
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
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:text-status-danger transition-opacity"
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

        {/* Footer: User Profile & macOS Segmented Controls */}
        <div className="p-3 border-t border-black/5 dark:border-white/10 bg-black/2 dark:bg-white/2">
          {/* User Profile Card */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="w-full flex items-center justify-between p-2 rounded-xl bg-surface border border-black/5 dark:border-white/10 hover:bg-surface-hover transition-colors shadow-subtle text-left"
              title="Switch user role or department"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-full bg-foreground text-background font-semibold flex items-center justify-center text-xs shadow-subtle">
                  {currentUser.full_name[0]}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-foreground truncate">
                    {currentUser.full_name}
                  </div>
                  <div className="text-[10.5px] text-muted-foreground truncate">
                    <span className="capitalize">{currentUser.role}</span> • {currentUser.department}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
            </button>

            {/* Role Switcher Menu */}
            {showRoleMenu && (
              <div className="absolute bottom-full mb-2 left-0 w-full bg-surface border border-border rounded-2xl shadow-popover p-1.5 z-50 animate-fade-in text-xs">
                <div className="text-[10px] font-semibold text-muted-foreground uppercase px-2.5 py-1">
                  Switch Active Role
                </div>
                <button
                  onClick={() => {
                    switchUserRole("admin");
                    setShowRoleMenu(false);
                  }}
                  className={cn(
                    "w-full text-left p-2 rounded-xl flex items-center justify-between transition-colors",
                    currentUser.role === "admin"
                      ? "bg-black/8 dark:bg-white/12 text-foreground font-medium"
                      : "hover:bg-surface-hover text-foreground"
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
                    "w-full text-left p-2 rounded-xl flex items-center justify-between transition-colors",
                    currentUser.role === "employee"
                      ? "bg-black/8 dark:bg-white/12 text-foreground font-medium"
                      : "hover:bg-surface-hover text-foreground"
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

          {/* Theme Segmented Control (Apple System/Light/Dark) */}
          <div className="mt-2.5 flex items-center justify-between p-1 rounded-xl bg-black/4 dark:bg-white/5 border border-black/5 dark:border-white/10 text-muted-foreground">
            <span className="text-[11px] font-medium pl-2">Theme</span>
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => setTheme("system")}
                className={cn(
                  "p-1.5 rounded-lg text-xs transition-all",
                  theme === "system"
                    ? "bg-surface text-foreground shadow-apple font-medium"
                    : "hover:text-foreground"
                )}
                title="System Theme"
              >
                <Laptop className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme("light")}
                className={cn(
                  "p-1.5 rounded-lg text-xs transition-all",
                  theme === "light"
                    ? "bg-surface text-foreground shadow-apple font-medium"
                    : "hover:text-foreground"
                )}
                title="Light Theme"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={cn(
                  "p-1.5 rounded-lg text-xs transition-all",
                  theme === "dark"
                    ? "bg-surface text-foreground shadow-apple font-medium"
                    : "hover:text-foreground"
                )}
                title="Dark Theme (Pitch Black)"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
