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
  User,
  Sun,
  Moon,
  Laptop,
  Check,
  ChevronRight,
  Database,
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
          className="fixed inset-0 bg-black/40 z-40 md:hidden apple-blur"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed md:static inset-y-0 left-0 z-40 w-72 bg-surface border-r border-border flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 select-none",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-border">
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <Logo size="md" />
          </Link>

          {/* Demo Mode Badge */}
          {demoMode && (
            <span
              className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-accent-subtle text-accent border border-accent/20"
              title="Demo Mode is ON: Sample enterprise data loaded"
            >
              Demo Mode
            </span>
          )}
        </div>

        {/* Action: New Chat */}
        <div className="p-3">
          <button
            onClick={() => {
              createNewConversation();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-accent text-accent-foreground font-medium text-xs hover:bg-accent-hover transition-colors shadow-subtle"
          >
            <Plus className="w-4 h-4" />
            <span>New Conversation</span>
          </button>
        </div>

        {/* Primary Navigation Links */}
        <nav className="px-3 py-1 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                  isActive
                    ? "bg-accent-subtle text-accent font-semibold"
                    : "text-foreground/80 hover:bg-surface-hover hover:text-foreground"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-accent" : "text-muted-foreground")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Separator */}
        <div className="my-2 border-t border-border/80 mx-3" />

        {/* Recent Conversations Header & Search */}
        <div className="px-4 pt-1 pb-2 flex flex-col gap-2">
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
                Clear all
              </button>
            )}
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchConvQuery}
              onChange={(e) => setSearchConvQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-surface-secondary/70 border border-border rounded-lg placeholder:text-muted-foreground focus:outline-none focus:border-accent/40"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
          {filteredConversations.length === 0 ? (
            <div className="px-3 py-6 text-center text-xs text-muted-foreground">
              No conversations found.
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
                    "group flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer transition-colors",
                    isActive
                      ? "bg-surface-secondary text-foreground font-medium border border-border"
                      : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-1">
                    <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 text-muted-foreground" />
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

        {/* Footer: User Role Switcher & Theme Selector */}
        <div className="p-3 border-t border-border bg-surface-secondary/20">
          {/* User Profile Card with Role Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="w-full flex items-center justify-between p-2 rounded-xl bg-surface border border-border hover:bg-surface-hover transition-colors shadow-subtle text-left"
              title="Switch user role or department"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-accent-subtle text-accent font-semibold flex items-center justify-center text-xs border border-accent/20">
                  {currentUser.full_name[0]}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-foreground truncate">
                    {currentUser.full_name}
                  </div>
                  <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <span className="capitalize">{currentUser.role}</span>
                    <span>•</span>
                    <span>{currentUser.department}</span>
                  </div>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
            </button>

            {/* Role Switcher Menu */}
            {showRoleMenu && (
              <div className="absolute bottom-full mb-2 left-0 w-full bg-surface border border-border rounded-xl shadow-apple p-2 z-50 animate-fade-in text-xs">
                <div className="text-[10px] font-semibold text-muted-foreground uppercase px-2 py-1">
                  Switch Active Role
                </div>
                <button
                  onClick={() => {
                    switchUserRole("admin");
                    setShowRoleMenu(false);
                  }}
                  className={cn(
                    "w-full text-left p-2 rounded-lg flex items-center justify-between transition-colors",
                    currentUser.role === "admin"
                      ? "bg-accent-subtle text-accent font-medium"
                      : "hover:bg-surface-hover text-foreground"
                  )}
                >
                  <div>
                    <div className="font-medium">Sarah Chen (Admin)</div>
                    <div className="text-[10px] text-muted-foreground">Executive • All documents</div>
                  </div>
                  {currentUser.role === "admin" && <Check className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => {
                    switchUserRole("employee");
                    setShowRoleMenu(false);
                  }}
                  className={cn(
                    "w-full text-left p-2 rounded-lg flex items-center justify-between transition-colors",
                    currentUser.role === "employee"
                      ? "bg-accent-subtle text-accent font-medium"
                      : "hover:bg-surface-hover text-foreground"
                  )}
                >
                  <div>
                    <div className="font-medium">Alex Rivera (Employee)</div>
                    <div className="text-[10px] text-muted-foreground">Engineering • Restricted</div>
                  </div>
                  {currentUser.role === "employee" && <Check className="w-4 h-4" />}
                </button>
              </div>
            )}
          </div>

          {/* Theme Switcher Bar */}
          <div className="mt-2.5 flex items-center justify-between px-2 py-1 rounded-lg bg-surface-secondary border border-border text-muted-foreground">
            <span className="text-[11px]">Theme</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setTheme("system")}
                className={cn(
                  "p-1 rounded text-xs transition-colors",
                  theme === "system" ? "bg-surface text-foreground shadow-subtle" : "hover:text-foreground"
                )}
                title="System Theme"
              >
                <Laptop className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme("light")}
                className={cn(
                  "p-1 rounded text-xs transition-colors",
                  theme === "light" ? "bg-surface text-foreground shadow-subtle" : "hover:text-foreground"
                )}
                title="Light Theme"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={cn(
                  "p-1 rounded text-xs transition-colors",
                  theme === "dark" ? "bg-surface text-foreground shadow-subtle" : "hover:text-foreground"
                )}
                title="Dark Theme"
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
