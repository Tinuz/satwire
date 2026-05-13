"use client";

import { useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { CATEGORIES } from "@/lib/constants";
import { useFeedStore } from "@/store/feedStore";
import type { Category } from "@/types";

export function CategoryFilter() {
  const { filters, setCategory } = useFeedStore();
  const activeCategory = filters.category ?? null;
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSelect = useCallback(
    (value: Category | "all") => {
      setCategory(value === "all" ? null : value);
    },
    [setCategory]
  );

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
      role="tablist"
      aria-label="Categorieën"
    >
      {CATEGORIES.map(({ label, value }) => {
        const isActive =
          (value === "all" && activeCategory === null) ||
          value === activeCategory;
        return (
          <button
            key={value}
            role="tab"
            aria-selected={isActive}
            onClick={() => handleSelect(value)}
            className={cn(
              "flex-shrink-0 rounded-full border px-4 py-1.5 text-xs font-medium transition-all duration-200",
              isActive
                ? "border-primary/60 bg-primary/15 text-primary scale-105 shadow-[0_0_14px_rgba(0,255,85,0.35)]"
                : "border-white/[0.08] bg-white/[0.03] text-muted-foreground hover:border-primary/30 hover:text-primary/80 hover:bg-primary/5"
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
