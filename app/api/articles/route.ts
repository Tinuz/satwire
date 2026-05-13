import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PAGE_SIZE } from "@/lib/constants";
import type { Article, FeedPage } from "@/types";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const cursor = searchParams.get("cursor");       // ISO timestamp of last item
  const category = searchParams.get("category");
  const categories = searchParams.get("categories"); // comma-separated for personalized feed
  const sourceId = searchParams.get("source");
  const coin = searchParams.get("coin");
  const coins = searchParams.get("coins");           // comma-separated for personalized feed
  const query = searchParams.get("q");
  const dateFrom = searchParams.get("from");
  const dateTo = searchParams.get("to");

  const supabase = await createClient();

  let dbQuery = supabase
    .from("articles")
    .select(
      `id, title, url, image_url, summary, published_at, category, coins, is_breaking, sentiment,
       source:sources(id, name, logo_url, url)`
    )
    .order("published_at", { ascending: false })
    .limit(PAGE_SIZE);

  // Cursor-based pagination: fetch items older than the cursor
  if (cursor) {
    dbQuery = dbQuery.lt("published_at", cursor);
  }

  // Filters
  if (category) {
    dbQuery = dbQuery.eq("category", category);
  }
  // Multiple categories (OR) for personalized feed
  if (categories) {
    const categoryList = categories.split(",").filter(Boolean);
    if (categoryList.length > 0) {
      dbQuery = dbQuery.in("category", categoryList);
    }
  }
  if (sourceId) {
    dbQuery = dbQuery.eq("source_id", sourceId);
  }
  if (coin) {
    // coins is a text[] column – use Postgres @> operator via contains
    dbQuery = dbQuery.contains("coins", [coin.toUpperCase()]);
  }
  // Multiple coins (overlap) for personalized feed
  if (coins) {
    const coinList = coins.split(",").map((c) => c.toUpperCase()).filter(Boolean);
    if (coinList.length > 0) {
      dbQuery = dbQuery.overlaps("coins", coinList);
    }
  }
  if (dateFrom) {
    dbQuery = dbQuery.gte("published_at", dateFrom);
  }
  if (dateTo) {
    dbQuery = dbQuery.lte("published_at", dateTo);
  }
  if (query) {
    // Full-text search via generated tsvector column
    dbQuery = dbQuery.textSearch("fts", query, { type: "websearch" });
  }

  const { data, error } = await dbQuery;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const articles = (data ?? []) as unknown as Article[];
  const lastArticle = articles[articles.length - 1];
  const nextCursor = articles.length === PAGE_SIZE && lastArticle
    ? lastArticle.published_at
    : null;

  const response: FeedPage = { articles, nextCursor };

  return NextResponse.json(response, {
    headers: {
      // Cache for 60 seconds on the CDN edge
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
    },
  });
}
