import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ExternalLink, Calendar, Tag } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { CATEGORY_COLORS } from "@/lib/constants";
import { timeAgo, decodeEntities } from "@/utils/format";
import type { Article } from "@/types";

interface Props {
  params: Promise<{ id: string }>;
}

async function getArticle(id: string): Promise<Article | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select(
      `id, title, url, image_url, summary, published_at, category, coins, is_breaking,
       source:sources(id, name, logo_url, url)`
    )
    .eq("id", id)
    .single();

  if (error || !data) return null;
  // Default sentiment to 'neutral' until migration is applied
  return { sentiment: "neutral", ...data } as unknown as Article;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const article = await getArticle(id);
  if (!article) return { title: "Artikel niet gevonden – SatWire" };

  const title = decodeEntities(article.title);
  const description = article.summary
    ? decodeEntities(article.summary).slice(0, 160)
    : `${title} – lees het laatste crypto nieuws op SatWire.`;

  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://satwire.app";
  const ogImage = article.image_url
    ? article.image_url
    : `${BASE_URL}/api/og?id=${id}`;

  return {
    title: `${title} – SatWire`,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: article.published_at,
      authors: [article.source.name],
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: `/article/${id}`,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { id } = await params;
  const article = await getArticle(id);
  if (!article) notFound();

  const {
    title,
    url,
    image_url,
    summary,
    published_at,
    category,
    coins,
    source,
    is_breaking,
    sentiment,
  } = article;

  const categoryColor = CATEGORY_COLORS[category] ?? CATEGORY_COLORS.general;

  // JSON-LD structured data for Google Rich Results
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: decodeEntities(title),
    description: summary ? decodeEntities(summary) : undefined,
    image: image_url ? [image_url] : undefined,
    datePublished: published_at,
    author: {
      "@type": "Organization",
      name: source.name,
      url: source.url,
    },
    publisher: {
      "@type": "Organization",
      name: "SatWire",
      url: "https://satwire.app",
    },
    url,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://satwire.app/article/${id}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-2xl px-4 py-6 md:px-6">
        {/* Back button */}
        <Link
          href="/feed"
          className="mb-6 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Terug naar feed
        </Link>

        <article className="flex flex-col gap-5">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
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
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[10px] uppercase tracking-wider font-semibold"
                    : "border-red-500/30 bg-red-500/10 text-red-400 text-[10px] uppercase tracking-wider font-semibold"
                }
              >
                {sentiment === "bullish" ? "▲ Bullish" : "▼ Bearish"}
              </Badge>
            )}
          </div>

          {/* Title */}
          <h1 className="text-xl font-bold leading-snug text-foreground md:text-2xl">
            {decodeEntities(title)}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="font-medium text-foreground/70">{source.name}</span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <time dateTime={published_at}>{timeAgo(published_at)}</time>
            </span>
            {coins.length > 0 && (
              <span className="flex items-center gap-1">
                <Tag className="h-3 w-3" />
                {coins.join(", ")}
              </span>
            )}
          </div>

          {/* Hero image */}
          {image_url && (
            <div className="relative aspect-video w-full overflow-hidden rounded-xl ring-1 ring-white/[0.06]">
              <Image
                src={image_url}
                alt={decodeEntities(title)}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 672px"
                unoptimized={image_url.startsWith("http")}
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            </div>
          )}

          {/* Summary */}
          {summary && (
            <p className="text-sm leading-relaxed text-muted-foreground">
              {decodeEntities(summary)}
            </p>
          )}

          {/* CTA */}
          <div className="rounded-xl border border-white/[0.06] bg-card/60 p-4 text-center">
            <p className="mb-3 text-xs text-muted-foreground">
              Dit artikel is gepubliceerd door <span className="font-medium text-foreground/80">{source.name}</span>.
              Lees het volledige artikel op de originele bron.
            </p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-[0_0_20px_rgba(0,255,85,0.25)] transition-colors hover:bg-primary/90"
            >
              <ExternalLink className="h-4 w-4" />
              Lees volledig artikel
            </a>
          </div>
        </article>
      </div>
    </>
  );
}
