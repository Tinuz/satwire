import Link from "next/link";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CATEGORY_COLORS } from "@/lib/constants";
import { timeAgo, truncate, decodeEntities } from "@/utils/format";
import type { Article } from "@/types";

interface NewsCardProps {
  article: Article;
}

export function NewsCard({ article }: NewsCardProps) {
  const {
    title,
    url,
    image_url,
    summary,
    published_at,
    category,
    source,
    is_breaking,
    sentiment,
  } = article;

  const categoryColor = CATEGORY_COLORS[category] ?? CATEGORY_COLORS.general;

  return (
    <article className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-card/70 backdrop-blur-sm transition-all duration-300 hover:border-primary/25 hover:bg-card/90 hover:shadow-[0_0_28px_rgba(0,255,85,0.07),0_8px_32px_rgba(0,0,0,0.5)]">
      {/* Left glow accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full bg-gradient-to-b from-transparent via-primary/0 to-transparent transition-all duration-300 group-hover:via-primary/50" />

      <Link
        href={`/article/${article.id}`}
        className="block"
      >
        <div className="flex gap-3 p-4">
          {/* Text content */}
          <div className="flex min-w-0 flex-1 flex-col gap-2">

            {/* Row 1: badges */}
            <div className="flex flex-wrap items-center gap-1.5">
              {is_breaking && (
                <Badge className="animate-pulse-glow border-primary/50 bg-primary/20 text-primary text-[10px] uppercase tracking-wider font-bold">
                  ⚡ Breaking
                </Badge>
              )}
              <Badge
                variant="outline"
                className={`border text-[10px] uppercase tracking-wider font-semibold ${categoryColor}`}
              >
                {category}
              </Badge>
              {sentiment && sentiment !== "neutral" && (
                <Badge
                  variant="outline"
                  className={
                    sentiment === "bullish"
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold hidden sm:inline-flex"
                      : "border-red-500/30 bg-red-500/10 text-red-400 text-[10px] font-semibold hidden sm:inline-flex"
                  }
                >
                  {sentiment === "bullish" ? "▲" : "▼"}
                </Badge>
              )}
            </div>

            {/* Row 2: source · time — always on one line */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-muted-foreground/70 truncate max-w-[120px]">
                {source.name}
              </span>
              <span className="text-muted-foreground/30 text-[10px]">·</span>
              <time dateTime={published_at} className="text-[11px] text-muted-foreground/50 whitespace-nowrap">
                {timeAgo(published_at)}
              </time>
            </div>

            {/* Title */}
            <h2 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground transition-colors duration-200 group-hover:text-primary md:text-[15px]">
              {decodeEntities(title)}
            </h2>

            {/* Summary */}
            {summary && (
              <p className="line-clamp-2 text-xs text-muted-foreground/50 leading-relaxed hidden sm:block">
                {decodeEntities(truncate(summary, 160))}
              </p>
            )}

            {/* Source link hint */}
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-medium text-muted-foreground/35 transition-colors duration-200 group-hover:text-primary/50">
              <ExternalLink className="h-2.5 w-2.5" />
              <span>{source.name}</span>
            </div>
          </div>

          {/* Thumbnail */}
          {image_url && (
            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg sm:h-24 sm:w-24 md:h-28 md:w-28 ring-1 ring-white/[0.06] group-hover:ring-primary/20 transition-all duration-300">
              <Image
                src={image_url}
                alt={title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 640px) 80px, (max-width: 768px) 96px, 112px"
                unoptimized={image_url.startsWith("http")}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>
          )}
        </div>
      </Link>
    </article>
  );
}
