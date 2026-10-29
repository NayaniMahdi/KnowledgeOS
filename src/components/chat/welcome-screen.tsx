"use client";

import React from "react";
import { Sparkles, ArrowRight, ShieldCheck, Compass, DollarSign, RefreshCw, FileText } from "lucide-react";
import { Logo } from "@/lib/../components/ui/logo";

interface WelcomeScreenProps {
  onSelectPrompt: (prompt: string) => void;
}

export function WelcomeScreen({ onSelectPrompt }: WelcomeScreenProps) {
  const examplePrompts = [
    {
      title: "Client Onboarding",
      question: "What is our client onboarding process?",
      icon: Compass,
      description: "Learn about the 3-stage onboarding workflow and timeline",
    },
    {
      title: "Service Packages & Rates",
      question: "Explain our service packages and pricing.",
      icon: DollarSign,
      description: "Review commercial retainer tiers and overage rates",
    },
    {
      title: "Refund & Cancellation",
      question: "What is the refund or cancellation policy?",
      icon: RefreshCw,
      description: "Check notice periods, SOW terms, and deposit rules",
    },
    {
      title: "Incident Response",
      question: "Explain our engineering incident severity escalation SOP.",
      icon: FileText,
      description: "Review P1 through P4 classifications and postmortem rules",
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto animate-fade-in my-auto">
      {/* Brand Icon */}
      <div className="mb-4">
        <Logo size="lg" showWordmark={false} />
      </div>

      {/* Main Title */}
      <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
        Your company’s knowledge, <br className="hidden sm:inline" />
        one conversation away.
      </h1>

      {/* Supporting Description */}
      <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-lg">
        Ask about policies, procedures, services, pricing, or internal projects.
        Answers are verified and grounded in your approved company documentation.
      </p>

      {/* Trust & Grounding Pill */}
      <div className="inline-flex items-center gap-2 mt-4 px-3 py-1 rounded-full bg-accent-subtle/80 text-accent text-xs font-medium border border-accent/20">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>Strictly grounded with source citations • Zero hallucinations</span>
      </div>

      {/* Suggested Questions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mt-8 text-left">
        {examplePrompts.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={() => onSelectPrompt(item.question)}
              className="p-3.5 rounded-xl bg-surface border border-border hover:border-accent/40 hover:bg-surface-hover transition-all text-left group shadow-subtle flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="w-6 h-6 rounded-md bg-accent-subtle text-accent flex items-center justify-center">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
                </div>
                <h4 className="text-xs font-semibold text-foreground group-hover:text-accent transition-colors">
                  {item.title}
                </h4>
                <p className="text-[12px] text-muted-foreground mt-0.5 line-clamp-1">
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
