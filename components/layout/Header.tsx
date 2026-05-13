"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { PriceTicker } from "@/components/layout/PriceTicker";

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-black/80 backdrop-blur-xl">
      {/* Gradient accent line at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/feed" className="flex items-center gap-2.5 select-none">
          <span className="text-[22px] font-bold tracking-[-0.03em]">
            <span className="text-primary">Sat</span>
            <span className="text-foreground">Wire</span>
          </span>
          <span className="hidden text-xs text-muted-foreground/60 md:inline">
            Crypto nieuws – op één plek
          </span>
        </Link>

        {/* Actions */}
        <nav className="flex items-center gap-1">
          <Link
            href="/search"
            aria-label="Zoeken"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-all duration-200 hover:bg-primary/10 hover:text-primary hover:shadow-[0_0_14px_rgba(0,255,85,0.3)]"
          >
            <Search className="h-4 w-4" />
          </Link>
          <button
            aria-label="Notificaties"
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-all duration-200 hover:bg-primary/10 hover:text-primary hover:shadow-[0_0_14px_rgba(0,255,85,0.3)]"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary animate-badge-pulse shadow-[0_0_6px_rgba(0,255,85,0.9)]" />
          </button>
          <Link
            href="/profile"
            aria-label="Profiel"
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-md transition-all duration-200 hover:bg-primary/10 hover:text-primary hover:shadow-[0_0_14px_rgba(0,255,85,0.3)]",
              pathname.startsWith("/profile")
                ? "bg-primary/10 text-primary shadow-[0_0_14px_rgba(0,255,85,0.3)]"
                : "text-muted-foreground"
            )}
          >
            <User className="h-4 w-4" />
          </Link>
        </nav>
      </div>

      {/* Price ticker below main header row */}
      <PriceTicker />
    </header>
  );
}

