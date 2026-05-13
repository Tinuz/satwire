import { create } from "zustand";
import type { Article, ArticleFilters, Category } from "@/types";

interface FeedState {
  articles: Article[];
  filters: ArticleFilters;
  nextCursor: string | null;
  isLoading: boolean;
  hasMore: boolean;
  error: string | null;
  personalizedMode: boolean;

  // Actions
  setArticles: (articles: Article[]) => void;
  appendArticles: (articles: Article[], nextCursor: string | null) => void;
  setFilters: (filters: Partial<ArticleFilters>) => void;
  resetFeed: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCategory: (category: Category | null) => void;
  togglePersonalizedMode: () => void;
}

export const useFeedStore = create<FeedState>((set) => ({
  articles: [],
  filters: {},
  nextCursor: null,
  isLoading: false,
  hasMore: true,
  error: null,
  personalizedMode: false,

  setArticles: (articles) => set({ articles, hasMore: articles.length > 0 }),

  appendArticles: (articles, nextCursor) =>
    set((state) => {
      const existingIds = new Set(state.articles.map((a) => a.id));
      const fresh = articles.filter((a) => !existingIds.has(a.id));
      return {
        articles: [...state.articles, ...fresh],
        nextCursor,
        hasMore: nextCursor !== null,
      };
    }),

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
      // Reset pagination when filters change
      articles: [],
      nextCursor: null,
      hasMore: true,
    })),

  resetFeed: () =>
    set({ articles: [], nextCursor: null, hasMore: true, error: null }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  setCategory: (category) =>
    set({
      filters: { category },
      articles: [],
      nextCursor: null,
      hasMore: true,
    }),

  togglePersonalizedMode: () =>
    set((state) => ({
      personalizedMode: !state.personalizedMode,
      articles: [],
      nextCursor: null,
      hasMore: true,
      error: null,
    })),
}));
