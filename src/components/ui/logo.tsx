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
      {/* Precision Geometric Knowledge Symbol */}
      <div
        className={cn(
          "relative flex items-center justify-center rounded-lg bg-surface border border-border shadow-subtle text-accent overflow-hidden transition-transform hover:scale-[1.02]",
          iconSizes[size]
        )}
      >
        <svg
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-1"
        >
          {/* Subtle background tone */}
          <rect width="28" height="28" rx="6" fill="currentColor" fillOpacity="0.08" />
          
          {/* Layered Document / Knowledge Folio Leaves */}
          <path
            d="M6 8.5C6 7.67157 6.67157 7 7.5 7H14.5C15.3284 7 16 7.67157 16 8.5V20.5C16 21.3284 15.3284 22 14.5 22H7.5C6.67157 22 6 21.3284 6 20.5V8.5Z"
            fill="currentColor"
            fillOpacity="0.85"
          />
          <path
            d="M12 7.5C12 6.67157 12.6716 6 13.5 6H20.5C21.3284 6 22 6.67157 22 7.5V19.5C22 20.3284 21.3284 21 20.5 21H13.5C12.6716 21 12 20.3284 12 19.5V7.5Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Precision Alignment Notch */}
          <circle cx="10" cy="11" r="1.25" fill="#FFFFFF" fillOpacity="0.9" />
          <path
            d="M9 15H13"
            stroke="#FFFFFF"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Professional Typography Wordmark */}
      {showWordmark && (
        <div className="flex items-baseline tracking-tight">
          <span className={cn("text-foreground font-semibold tracking-[-0.02em]", textSizes[size])}>
            Knowledge<span className="text-accent font-medium">OS</span>
          </span>
        </div>
      )}
    </div>
  );
}
