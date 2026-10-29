"use client";

import React from "react";
import { useKnowledge } from "@/context/knowledge-context";
import { Menu, Sparkles, Shield, ToggleLeft, ToggleRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onToggleMobileMenu: () => void;
  title?: string;
}

export function Header({ onToggleMobileMenu, title = "Knowledge Assistant" }: HeaderProps) {
  const { demoMode, setDemoMode, currentUser, switchUserRole, selectedModel, selectedProvider } =
    useKnowledge();

  return (
    <header className="h-14 border-b border-border bg-surface/80 apple-blur sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h2 className="text-sm font-semibold text-foreground tracking-tight">
          {title}
        </h2>
      </div>

      {/* Right: Status Badges & Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Active Model Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-secondary text-[11px] font-medium text-foreground border border-border">
          <Sparkles className="w-3 h-3 text-accent" />
          <span className="capitalize">{selectedProvider}:</span>
          <span className="text-muted-foreground font-mono">
            {selectedModel.split("/").pop()?.replace(":free", "")}
          </span>
        </div>

        {/* Quick Role Indicator Pill */}
        <button
          onClick={() => switchUserRole(currentUser.role === "admin" ? "employee" : "admin")}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer select-none",
            currentUser.role === "admin"
              ? "bg-accent-subtle text-accent border-accent/20 hover:bg-accent/20"
              : "bg-surface-secondary text-muted-foreground border-border hover:bg-surface-hover"
          )}
          title="Click to toggle between Admin and Employee role"
        >
          <Shield className="w-3 h-3" />
          <span>Role: {currentUser.role === "admin" ? "Admin" : "Employee"}</span>
        </button>

        {/* Demo Mode Toggle */}
        <button
          onClick={() => setDemoMode(!demoMode)}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors select-none",
            demoMode
              ? "bg-surface text-foreground border-border hover:bg-surface-hover"
              : "bg-status-success/10 text-status-success border-status-success/20"
          )}
          title="Toggle Demo Mode"
        >
          {demoMode ? (
            <>
              <ToggleRight className="w-4 h-4 text-accent" />
              <span className="hidden sm:inline">Demo Mode: ON</span>
              <span className="sm:hidden">Demo</span>
            </>
          ) : (
            <>
              <ToggleLeft className="w-4 h-4 text-muted-foreground" />
              <span className="hidden sm:inline">Production</span>
              <span className="sm:hidden">Prod</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}
