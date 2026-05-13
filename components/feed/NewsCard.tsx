"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CATEGORY_COLORS } from "@/lib/constants";
import { timeAgo, truncate, decodeEntities } from "@/utils/format";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Article } from "@/types";

interface NewsCardProps {
  article: Article;
}

export function NewsCard({ article }: NewsCardProps) {
  const {
    title,
    image_url,
    summary,
    published_at,
    category,
    source,
    is_breaking,
    sentiment,
  } = article;

  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarking, setBookmarking] = useState(false);

  const categoryColor = CATEGORY_COLORS[category] ?? CATEGORY_COLORS.general;

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (bookmarking) return;

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Log in om artikelen te bookmarken");
      return;
    }

    setBookmarking(true);
    const next = !bookmarked;
    setBookmarked(next);

    try {
      if (next) {
        const { error } = await supabase
          .from("bookmarks")
          .upsert({ user_id: user.id, article_id: article.id });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("bookmarks")
          .delete()
          .eq("user_id", user.id)
          .eq("article_id", article.id);
        if (error) throw error;
      }
    } catch {
      setBookmarked(!next);
      toast.error("Bookmark mislukt, probeer opnieuw");
    } finally {
      setBookmarking(false);
    }
  };

  return (
    <article className="group relative overflow-hidden rounded-lg border border-white/[0.07] bg-card transition-colors duration-200 hover:border-white/[0.13] hover:bg-[oklch(0.12_0_0)]">
      <Link href={`/article/${article.id}`} className="block p-4">
        <div className="flex gap-4">
          {/* Text content */}
          <div className="flex min-w-0 flex-1 flex-col gap-2.5">

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-1.5">
              {is_breaking && (
                <span className="inline-flex items-center rounded-sm bg-primary/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-primary">
                  ⚡ Breaking
                </span>
              )}
              <Badge
                variant="outline"
                className={`rounded-sm text-[9px] font-semibold uppercase tracking-wider ${categoryColor}`}
              >
                {category}
              </Badge>
              {sentiment && sentiment !== "neutral" && (
                <span
                  className={`inline-flex items-center rounded-sm px-1.5 py-0.5 text-[9px] font-semibold ${
                    sentiment === "bullish"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {sentiment === "bullish" ? "↑" : "↓"} {sentiment}
                </span>
              )}
            </div>

            {/* Title */}
            <h2 className="line-clamp-2 text-[14px] font-semibold leading-[1.45] tracking-[-0.01em] text-foreground/95 transition-colors duration-200 group-hover:text-primary">
              {decodeEntities(title)}
            </h2>

            {/* Summary – desktop only */}
            {summary && (
              <p className="line-clamp-2 hidden text-[12px] leading-relaxed text-muted-foreground sm:block">
                {decodeEntities(truncate(summary, 160))}
              </p>
            )}

            {/* Source · time + bookmark */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-medium text-foreground/55">
                  {source.name}
                </span>
                <span className="text-foreground/20 text-[10px]">·</span>
                <time
                  dateTime={published_at}
                  className="text-[11px] text-foreground/40"
                >
                  {timeAgo(published_at)}
                </time>
              </div>
              <button
                onClick={handleBookmark}
                aria-label={bookmarked ? "Verwijder bookmark" : "Bewaar artikel"}
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded text-foreground/25 transition-colors duration-150 hover:text-primary"
              >
                {bookmarked ? (
                  <BookmarkCheck className="h-3.5 w-3.5 text-primary" />
                ) : (
                  <Bookmark className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Thumbnail */}
          {image_url && (
            <div className="relative h-[78px] w-[78px] flex-shrink-0 overflow-hidden rounded-md ring-1 ring-white/[0.07] transition-all duration-200 group-hover:ring-white/[0.14] sm:h-[90px] sm:w-[90px]">
              <Image
                src={image_url}
                alt={title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 78px, 90px"
                unoptimized={image_url.startsWith("http")}
              />
            </div>
          )}
        </div>
      </Link>
    </article>
  );
}
