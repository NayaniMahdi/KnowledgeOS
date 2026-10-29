"use client";

import React from "react";
import { ArrowRight, ShieldCheck, Compass, DollarSign, RefreshCw, FileText } from "lucide-react";
import { Logo } from "@/components/ui/logo";

interface WelcomeScreenProps {
  onSelectPrompt: (prompt: string) => void;
}

export function WelcomeScreen({ onSelectPrompt }: WelcomeScreenProps) {
  const examplePrompts = [
    {
      title: "Client Onboarding",
      question: "What is our client onboarding process?",
      icon: Compass,
      description: "Review the 3-stage onboarding workflow, buddy pairing, and timeline",
    },
    {
      title: "Service Packages & Rates",
      question: "Explain our service packages and pricing.",
      icon: DollarSign,
      description: "Explore commercial retainer tiers, overage rates, and discount caps",
    },
    {
      title: "Refund & Cancellation",
      question: "What is the refund or cancellation policy?",
      icon: RefreshCw,
      description: "Review notice periods, SOW terms, and non-refundable deposits",
    },
    {
      title: "Incident Response",
      question: "Explain our engineering incident severity escalation SOP.",
      icon: FileText,
      description: "Understand P1-P4 classifications, SLA targets, and postmortem rules",
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto animate-fade-in my-auto">
      {/* Brand Icon */}
      <div className="mb-5">
        <Logo size="lg" showWordmark={false} />
      </div>

      {/* Main Apple Title */}
      <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-foreground leading-tight">
        Your company’s knowledge, <br className="hidden sm:inline" />
        one conversation away.
      </h1>

      {/* Supporting Text */}
      <p className="mt-3 text-[14px] text-muted-foreground leading-relaxed max-w-lg">
        Ask about policies, procedures, services, pricing, or internal projects.
        Answers are strictly grounded in your approved company documentation.
      </p>

      {/* Trust & Grounding Pill */}
      <div className="inline-flex items-center gap-2 mt-4 px-3.5 py-1.5 rounded-full bg-white/50 dark:bg-white/[0.06] backdrop-blur-md text-foreground text-xs font-medium border border-black/8 dark:border-white/12 shadow-apple">
        <ShieldCheck className="w-3.5 h-3.5 opacity-80" />
        <span>Grounded with exact source citations • Zero hallucinations</span>
      </div>

      {/* Apple-styled Example Questions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mt-8 text-left">
        {examplePrompts.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              type="button"
              id={`prompt-card-${idx}`}
              onClick={() => onSelectPrompt(item.question)}
              className="p-4 rounded-2xl bg-white/70 dark:bg-black/60 backdrop-blur-2xl border border-black/8 dark:border-white/12 hover:border-foreground/40 hover:bg-white/85 dark:hover:bg-white/[0.08] hover:shadow-apple-hover transition-all text-left group shadow-apple flex flex-col justify-between cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-7 h-7 rounded-lg bg-black/5 dark:bg-white/10 text-foreground flex items-center justify-center shadow-subtle">
                    <Icon className="w-4 h-4 opacity-80" />
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                </div>
                <h4 className="text-[13.5px] font-semibold text-foreground group-hover:opacity-95 transition-opacity tracking-[-0.01em]">
                  {item.title}
                </h4>
                <p className="text-[12px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
