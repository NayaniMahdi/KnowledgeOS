import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
}

export function Logo({ className, size = "md", showWordmark = true }: LogoProps) {
  const iconSizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-[15px] font-semibold",
    lg: "text-lg font-semibold",
  };

  return (
    <div className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      {/* 1. LIGHT THEME BRAND ICON: Apple Studio KnowledgeOS 'K' Emblem */}
      <div
        className={cn(
          "dark:hidden relative flex items-center justify-center rounded-xl bg-black text-white shadow-[0_4px_14px_rgba(0,0,0,0.18)] transition-all hover:scale-[1.03]",
          iconSizes[size]
        )}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-1.5"
        >
          {/* Vertical Knowledge Spine */}
          <rect x="4.5" y="3.5" width="3.2" height="17" rx="1.6" fill="white" />
          {/* Upper Retrieval Ray */}
          <path
            d="M8.8 12.8L17.5 4.5"
            stroke="white"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Lower Synthesis Ray */}
          <path
            d="M10.8 11.8L18 20"
            stroke="white"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity="0.85"
          />
          {/* Core Knowledge Nexus */}
          <circle cx="8.8" cy="12.8" r="1.6" fill="white" />
        </svg>
      </div>

      {/* 2. DARK THEME BRAND ICON: Apple Obsidian Glowing Neural 'K' Emblem */}
      <div
        className={cn(
          "hidden dark:flex relative items-center justify-center rounded-xl bg-white/[0.08] text-white border border-white/20 shadow-[0_0_18px_rgba(255,255,255,0.15),inset_0_1px_1px_rgba(255,255,255,0.4)] backdrop-blur-xl transition-all hover:scale-[1.03] hover:border-white/35",
          iconSizes[size]
        )}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-1.5"
        >
          {/* Neural Radiance Orbital Ring */}
          <circle
            cx="12"
            cy="12"
            r="8.8"
            stroke="white"
            strokeWidth="1"
            strokeOpacity="0.25"
            strokeDasharray="2 2.5"
          />
          {/* Gradient Vertical Spine */}
          <rect x="4.5" y="3.5" width="3.2" height="17" rx="1.6" fill="url(#k-dark-grad)" />
          {/* Upper Radiant Arm */}
          <path
            d="M8.8 12.8L17.5 4.5"
            stroke="url(#k-dark-grad)"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Lower Radiant Arm */}
          <path
            d="M10.8 11.8L18 20"
            stroke="url(#k-dark-grad)"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Glowing Neural Nexus Core */}
          <circle cx="8.8" cy="12.8" r="1.6" fill="white" />
          <circle cx="8.8" cy="12.8" r="2.8" stroke="white" strokeWidth="0.8" strokeOpacity="0.5" />
          <defs>
            <linearGradient id="k-dark-grad" x1="4" y1="3" x2="20" y2="21" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFFFFF" />
              <stop offset="0.6" stopColor="#E2E2E8" />
              <stop offset="1" stopColor="#A0A0A8" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Apple SF-Style Typography */}
      {showWordmark && (
        <div className="flex items-baseline tracking-[-0.03em]">
          <span className={cn("text-foreground font-semibold tracking-[-0.03em]", textSizes[size])}>
            Knowledge<span className="font-normal opacity-85">OS</span>
          </span>
        </div>
      )}
    </div>
  );
}
