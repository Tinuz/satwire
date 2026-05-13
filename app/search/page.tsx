"use client";

import { useState, useCallback, useTransition } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { NewsCard } from "@/components/feed/NewsCard";
import { NewsFeedSkeleton } from "@/components/feed/NewsCardSkeleton";
import { AppShell } from "@/components/layout/AppShell";
import type { Article } from "@/types";

function useDebounce<T extends (...args: Parameters<T>) => void>(fn: T, delay: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  }) as T;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Article[]>([]);
  const [isPending, startTransition] = useTransition();
  const [searched, setSearched] = useState(false);

  const doSearch = useCallback(async (q: string) => {
    const trimmed = q.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }
    setSearched(true);
    const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
    if (res.ok) {
      const data = await res.json();
      setResults(data.articles ?? []);
    }
  }, []);

  const debouncedSearch = useDebounce(
    (q: string) => startTransition(() => { doSearch(q); }),
    350
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    debouncedSearch(val);
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setSearched(false);
  };

  return (
    <AppShell>
      <div className="flex flex-col gap-4">
        {/* Search input */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            placeholder="Zoek naar nieuws, coins, onderwerpen…"
            value={query}
            onChange={handleChange}
            className="pl-9 pr-9 bg-card border-border/50 focus-visible:ring-primary/50"
          />
          {query && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Zoekopdracht wissen"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Loading */}
        {isPending && <NewsFeedSkeleton count={4} />}

        {/* Results */}
        {!isPending && results.length > 0 && (
          <>
            <p className="text-xs text-muted-foreground">
              {results.length} {results.length === 1 ? "resultaat" : "resultaten"} voor &ldquo;{query}&rdquo;
            </p>
            <div className="flex flex-col gap-3">
              {results.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          </>
        )}

        {/* Empty state */}
        {!isPending && searched && results.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <p className="text-sm font-medium">Geen resultaten</p>
            <p className="text-xs text-muted-foreground">
              Probeer andere zoektermen of een bredere zoekopdracht.
            </p>
          </div>
        )}

        {/* Prompt */}
        {!searched && !isPending && (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <Search className="h-10 w-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              Zoek naar nieuws, coins of onderwerpen
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
