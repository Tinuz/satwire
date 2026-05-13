"use client";

import { useRef, useCallback } from "react";
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
      className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide"
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
              "flex-shrink-0 rounded px-3 py-1.5 text-[12px] font-medium tracking-tight transition-colors duration-150 outline-none focus-visible:ring-1 focus-visible:ring-primary",
              isActive
                ? "bg-primary/[0.14] text-primary ring-1 ring-inset ring-primary/30"
                : "border border-white/[0.08] bg-transparent text-muted-foreground hover:border-white/[0.16] hover:bg-white/[0.03] hover:text-foreground/80"
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
