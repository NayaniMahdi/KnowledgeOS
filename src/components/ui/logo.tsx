import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
}

export function Logo({ className, size = "md", showWordmark = true }: LogoProps) {
  const iconSizes = {
    sm: "w-5 h-5",
    md: "w-7 h-7",
    lg: "w-9 h-9",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base font-medium",
    lg: "text-xl font-semibold",
  };

  return (
    <div className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      {/* Precision Apple-Style Monochromatic Emblem */}
      <div
        className={cn(
          "relative flex items-center justify-center rounded-[10px] bg-foreground text-background shadow-apple transition-transform hover:scale-[1.02]",
          iconSizes[size]
        )}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-1.5"
        >
          {/* Layered Document & Aperture Geometry in Pure Contrast */}
          <path
            d="M5 6C5 4.89543 5.89543 4 7 4H14L19 9V18C19 19.1046 18.1046 20 17 20H7C5.89543 20 5 19.1046 5 18V6Z"
            fill="currentColor"
            fillOpacity="0.15"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M14 4V9H19"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <circle cx="10" cy="14" r="1.5" fill="currentColor" />
          <path
            d="M13.5 14H16"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Apple SF-Style Clean Typography */}
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
