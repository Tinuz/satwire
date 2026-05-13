"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Newspaper, Search, Bookmark, Settings, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/feed", icon: Newspaper, label: "Feed" },
  { href: "/search", icon: Search, label: "Zoeken" },
  { href: "/bookmarks", icon: Bookmark, label: "Opgeslagen" },
  { href: "/pricing", icon: Zap, label: "Premium" },
  { href: "/settings", icon: Settings, label: "Instellingen" },
];

/**
 * Bottom navigation bar – visible on mobile only (hidden md+).
 * On desktop, navigation lives in the Header and/or Sidebar.
 */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.06] bg-black/85 backdrop-blur-xl md:hidden">
      {/* Gradient accent line at top */}
      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <ul className="flex h-16 items-center">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-0.5 py-2 text-xs transition-all duration-200",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground/60"
                )}
              >
                {/* Active glow bar */}
                {active && (
                  <span className="absolute top-0 h-0.5 w-8 rounded-full bg-primary shadow-[0_0_10px_rgba(0,255,85,0.9)]" />
                )}
                <Icon
                  className={cn(
                    "h-5 w-5 transition-all duration-200",
                    active && "drop-shadow-[0_0_6px_rgba(0,255,85,0.7)]"
                  )}
                />
                <span className={cn("text-[10px] font-medium", active && "text-primary")}>
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
