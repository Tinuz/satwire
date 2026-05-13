"use client";

import { AlertCircle, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewsCard } from "@/components/feed/NewsCard";
import { NewsFeedSkeleton } from "@/components/feed/NewsCardSkeleton";
import { CategoryFilter } from "@/components/feed/CategoryFilter";
import { useFeed } from "@/hooks/useFeed";
import { useInView } from "@/hooks/useInView";
import { useFeedStore } from "@/store/feedStore";
import { useUserStore } from "@/store/userStore";
import { cn } from "@/lib/utils";

export default function FeedClient() {
  const { articles, isLoading, hasMore, error, loadMore } = useFeed();
  const { resetFeed, personalizedMode, togglePersonalizedMode } = useFeedStore();
  const { preferences, isAuthenticated } = useUserStore();

  const hasPreferences =
    preferences.followedCategories.length > 0 ||
    preferences.followedCoins.length > 0;

  // Trigger next page when the sentinel element enters view
  const sentinelRef = useInView(() => {
    if (!isLoading && hasMore) loadMore();
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Feed mode toggle (only visible when user has preferences) */}
      {isAuthenticated && hasPreferences && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (personalizedMode) togglePersonalizedMode();
            }}
            className={cn(
              "rounded-full border px-4 py-1.5 text-xs font-medium transition-all duration-200",
              !personalizedMode
                ? "border-primary/60 bg-primary/15 text-primary scale-105 shadow-[0_0_14px_rgba(0,255,85,0.35)]"
                : "border-white/[0.08] bg-white/[0.03] text-muted-foreground hover:border-primary/30 hover:text-primary/80"
            )}
          >
            Alle nieuws
          </button>
          <button
            onClick={() => {
              if (!personalizedMode) togglePersonalizedMode();
            }}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-medium transition-all duration-200",
              personalizedMode
                ? "border-primary/60 bg-primary/15 text-primary scale-105 shadow-[0_0_14px_rgba(0,255,85,0.35)]"
                : "border-white/[0.08] bg-white/[0.03] text-muted-foreground hover:border-primary/30 hover:text-primary/80"
            )}
          >
            <Sparkles className="h-3 w-3" />
            Mijn Feed
          </button>
        </div>
      )}

      {/* Category filter bar (hidden in personalized mode) */}
      {!personalizedMode && <CategoryFilter />}

      {/* Personalized mode info bar */}
      {personalizedMode && hasPreferences && (
        <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-primary/80">
          <Sparkles className="h-3 w-3 shrink-0" />
          <span>
            Gefilterd op{" "}
            {preferences.followedCategories.length > 0 &&
              preferences.followedCategories.join(", ")}
            {preferences.followedCategories.length > 0 &&
              preferences.followedCoins.length > 0 && " · "}
            {preferences.followedCoins.length > 0 &&
              preferences.followedCoins.join(", ")}
          </span>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-6 text-center">
          <AlertCircle className="h-6 w-6 text-destructive" />
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { resetFeed(); loadMore(); }}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Opnieuw proberen
          </Button>
        </div>
      )}

      {/* Initial skeleton */}
      {articles.length === 0 && isLoading && <NewsFeedSkeleton count={8} />}

      {/* Article list */}
      {articles.length > 0 && (
        <div className="flex flex-col gap-3">
          {articles.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      )}

      {/* Load-more skeleton (appending) */}
      {isLoading && articles.length > 0 && <NewsFeedSkeleton count={4} />}

      {/* Invisible sentinel for IntersectionObserver */}
      {!error && <div ref={sentinelRef} className="h-1" aria-hidden />}

      {/* End-of-feed message */}
      {!hasMore && !isLoading && articles.length > 0 && (
        <p className="py-6 text-center text-xs text-muted-foreground">
          Je hebt alle artikelen gelezen.
        </p>
      )}

      {/* Empty state */}
      {!isLoading && articles.length === 0 && !error && (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <p className="text-sm font-medium text-foreground">Geen artikelen gevonden</p>
          <p className="text-xs text-muted-foreground">
            {personalizedMode
              ? "Volg meer coins of categorieën in je profiel."
              : "Probeer een andere categorie of filter."}
          </p>
        </div>
      )}
    </div>
  );
}

