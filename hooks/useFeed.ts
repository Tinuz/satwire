import { useCallback, useEffect, useRef } from "react";
import { useFeedStore } from "@/store/feedStore";
import { useUserStore } from "@/store/userStore";
import type { ArticleFilters, FeedPage } from "@/types";

/**
 * Fetches articles from /api/articles and manages the feed store state.
 * Handles cursor-based pagination and filter changes.
 */
export function useFeed() {
  const {
    articles,
    filters,
    nextCursor,
    isLoading,
    hasMore,
    error,
    personalizedMode,
    appendArticles,
    setLoading,
    setError,
    resetFeed,
  } = useFeedStore();

  const { preferences } = useUserStore();

  // Track the currently active filters to reset feed when they change
  const filtersRef = useRef<ArticleFilters>({});

  const fetchPage = useCallback(
    async (cursor: string | null, currentFilters: ArticleFilters) => {
      if (isLoading) return;
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (cursor) params.set("cursor", cursor);

        // Personalized mode: use followed categories/coins (multi-filter)
        if (personalizedMode) {
          if (preferences.followedCategories.length > 0) {
            params.set("categories", preferences.followedCategories.join(","));
          }
          if (preferences.followedCoins.length > 0) {
            params.set("coins", preferences.followedCoins.join(","));
          }
        } else {
          if (currentFilters.category) params.set("category", currentFilters.category);
          if (currentFilters.coin) params.set("coin", currentFilters.coin);
        }

        if (currentFilters.sourceId) params.set("source", currentFilters.sourceId);
        if (currentFilters.query) params.set("q", currentFilters.query);
        if (currentFilters.dateFrom) params.set("from", currentFilters.dateFrom);
        if (currentFilters.dateTo) params.set("to", currentFilters.dateTo);

        const res = await fetch(`/api/articles?${params.toString()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data: FeedPage = await res.json();
        appendArticles(data.articles, data.nextCursor);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Kan artikelen niet laden");
      } finally {
        setLoading(false);
      }
    },
    [isLoading, personalizedMode, preferences.followedCategories, preferences.followedCoins, appendArticles, setLoading, setError]
  );

  // Reset and reload when filters or personalized mode changes
  const personalizedModeRef = useRef(personalizedMode);
  useEffect(() => {
    const filtersChanged =
      JSON.stringify(filters) !== JSON.stringify(filtersRef.current);
    const modeChanged = personalizedMode !== personalizedModeRef.current;
    if (filtersChanged || modeChanged) {
      filtersRef.current = filters;
      personalizedModeRef.current = personalizedMode;
      resetFeed();
      fetchPage(null, filters);
    }
  }, [filters, personalizedMode, fetchPage, resetFeed]);

  // Initial load
  useEffect(() => {
    if (articles.length === 0 && !isLoading) {
      fetchPage(null, filters);
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      fetchPage(nextCursor, filters);
    }
  }, [isLoading, hasMore, nextCursor, filters, fetchPage]);

  return { articles, isLoading, hasMore, error, loadMore };
}
