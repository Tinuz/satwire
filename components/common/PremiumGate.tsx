"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { Zap, Lock } from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { cn } from "@/lib/utils";

interface PremiumGateProps {
  children: ReactNode;
  /** Short description of what requires premium */
  feature?: string;
  /** If true, renders a compact inline lock instead of a full overlay */
  inline?: boolean;
  className?: string;
}

/**
 * Wraps a UI section and replaces it with an upgrade prompt for non-premium users.
 */
export function PremiumGate({ children, feature, inline = false, className }: PremiumGateProps) {
  const { isPremium, isAuthenticated } = useUserStore();

  if (isPremium()) {
    return <>{children}</>;
  }

  if (inline) {
    return (
      <div className={cn("inline-flex items-center gap-1.5 text-xs text-muted-foreground", className)}>
        <Lock className="h-3 w-3 text-primary/60" />
        <span>{feature ?? "Premium"}</span>
        <Link
          href="/pricing"
          className="font-medium text-primary hover:underline"
        >
          Upgrade
        </Link>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex flex-col items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-6 text-center",
        className
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/30">
        <Zap className="h-5 w-5 text-primary" />
      </div>
      <p className="text-sm font-semibold text-foreground">
        {feature ?? "Premium feature"}
      </p>
      <p className="text-xs text-muted-foreground">
        {isAuthenticated
          ? "Upgrade naar Premium om toegang te krijgen."
          : "Log in en upgrade naar Premium om toegang te krijgen."}
      </p>
      <Link
        href="/pricing"
        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-[0_0_16px_rgba(0,255,85,0.2)] transition-colors hover:bg-primary/90"
      >
        <Zap className="h-3.5 w-3.5" />
        Bekijk Premium
      </Link>
    </div>
  );
}
