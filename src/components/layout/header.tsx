"use client";

import React from "react";
import { useKnowledge } from "@/context/knowledge-context";
import { Shield, ToggleLeft, ToggleRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onToggleMobileMenu: () => void;
  title?: string;
}

export function Header({ onToggleMobileMenu, title = "Knowledge Assistant" }: HeaderProps) {
  const {
    demoMode,
    setDemoMode,
    currentUser,
    switchUserRole,
    isSidebarCollapsed,
    toggleSidebar,
  } = useKnowledge();

  return (
    <header className="h-14 border-b border-black/8 dark:border-white/10 bg-white/70 dark:bg-black/60 apple-blur sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6">
      {/* Left: Single 3-Lines Toggle & Page Title */}
      <div className="flex items-center gap-2.5">
        <button
          id="sidebar-toggle-btn"
          onClick={() => {
            onToggleMobileMenu();
            toggleSidebar();
          }}
          className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10 transition-all active:scale-95 cursor-pointer"
          title={isSidebarCollapsed ? "Expand Sidebar (3-Lines Menu)" : "Collapse Sidebar (3-Lines Menu)"}
          aria-label="Toggle sidebar"
        >
          {/* Authentic 3-Lines Icon Design */}
          <div className="w-4 h-4 flex flex-col justify-center gap-[3px]">
            <span className="w-4 h-[1.8px] bg-current rounded-full transition-all" />
            <span className="w-3.5 h-[1.8px] bg-current rounded-full transition-all" />
            <span className="w-4 h-[1.8px] bg-current rounded-full transition-all" />
          </div>
        </button>

        <h2 className="text-[14px] font-semibold text-foreground tracking-[-0.015em]">
          {title}
        </h2>
      </div>

      {/* Right: Status Badges & Controls (Role & Demo Mode) */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Quick Role Switcher Pill */}
        <button
          onClick={() => switchUserRole(currentUser.role === "admin" ? "employee" : "admin")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1 rounded-full text-[11.5px] font-medium border transition-all cursor-pointer select-none shadow-subtle",
            currentUser.role === "admin"
              ? "bg-foreground text-background border-foreground font-semibold"
              : "bg-white/50 dark:bg-white/[0.06] backdrop-blur-md text-foreground border-black/8 dark:border-white/10 hover:bg-white/70 dark:hover:bg-white/[0.10]"
          )}
          title="Click to toggle between Admin and Employee role"
        >
          <Shield className="w-3 h-3" />
          <span>{currentUser.role === "admin" ? "Admin" : "Employee"}</span>
        </button>

        {/* Demo Mode Toggle */}
        <button
          onClick={() => setDemoMode(!demoMode)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1 rounded-full text-[11.5px] font-medium border transition-all select-none shadow-subtle",
            demoMode
              ? "bg-white/50 dark:bg-white/[0.06] backdrop-blur-md text-foreground border-black/8 dark:border-white/10 hover:bg-white/70 dark:hover:bg-white/[0.10]"
              : "bg-foreground text-background border-foreground font-semibold"
          )}
          title="Toggle Demo Mode"
        >
          {demoMode ? (
            <>
              <ToggleRight className="w-3.5 h-3.5 text-foreground" />
              <span className="hidden sm:inline">Demo Mode</span>
              <span className="sm:hidden">Demo</span>
            </>
          ) : (
            <>
              <ToggleLeft className="w-3.5 h-3.5 opacity-60" />
              <span className="hidden sm:inline">Production</span>
              <span className="sm:hidden">Prod</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}
