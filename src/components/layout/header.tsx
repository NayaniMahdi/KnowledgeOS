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
    <header className="h-14 border-b border-black/5 dark:border-white/10 bg-background/85 dark:bg-black/85 apple-blur sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h2 className="text-[14px] font-semibold text-foreground tracking-[-0.015em]">
          {title}
        </h2>
      </div>

      {/* Right: Status Badges & Controls */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Active Model Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface border border-black/5 dark:border-white/10 text-[11.5px] font-medium text-foreground shadow-subtle">
          <Sparkles className="w-3 h-3 opacity-70" />
          <span className="capitalize text-muted-foreground">{selectedProvider}:</span>
          <span className="font-mono text-foreground">
            {selectedModel.split("/").pop()?.replace(":free", "")}
          </span>
        </div>

        {/* Quick Role Switcher Pill */}
        <button
          onClick={() => switchUserRole(currentUser.role === "admin" ? "employee" : "admin")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1 rounded-full text-[11.5px] font-medium border transition-all cursor-pointer select-none shadow-subtle",
            currentUser.role === "admin"
              ? "bg-foreground text-background border-foreground font-semibold"
              : "bg-surface text-foreground border-border hover:bg-surface-hover"
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
              ? "bg-surface text-foreground border-border hover:bg-surface-hover"
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
