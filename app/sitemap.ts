import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { CATEGORIES } from "@/lib/constants";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://satwire.app";

const TOP_COINS = [
  "BTC", "ETH", "SOL", "BNB", "XRP", "ADA", "AVAX", "DOGE", "DOT", "POL",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  // Fetch latest 1000 article IDs + dates for article pages
  const { data: articles } = await supabase
    .from("articles")
    .select("id, published_at")
    .order("published_at", { ascending: false })
    .limit(1000);

  const articleUrls: MetadataRoute.Sitemap = (articles ?? []).map((a) => ({
    url: `${BASE_URL}/article/${a.id}`,
    lastModified: a.published_at,
    changeFrequency: "never",
    priority: 0.7,
  }));

  const categoryUrls: MetadataRoute.Sitemap = CATEGORIES.filter(
    (c) => c.value !== "all"
  ).map((c) => ({
    url: `${BASE_URL}/feed?category=${c.value}`,
    changeFrequency: "hourly",
    priority: 0.8,
  }));

  const coinUrls: MetadataRoute.Sitemap = TOP_COINS.map((coin) => ({
    url: `${BASE_URL}/feed?coin=${coin}`,
    changeFrequency: "hourly",
    priority: 0.75,
  }));

  const staticUrls: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/feed`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${BASE_URL}/search`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${BASE_URL}/pricing`, changeFrequency: "monthly", priority: 0.6 },
  ];

  return [...staticUrls, ...categoryUrls, ...coinUrls, ...articleUrls];
}
