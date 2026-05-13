import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim();

  if (!query || query.length < 2) {
    return NextResponse.json({ articles: [] });
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("articles")
    .select(
      `id, title, url, image_url, summary, published_at, category, coins, is_breaking,
       source:sources(id, name, logo_url, url)`
    )
    .textSearch("fts", query, { type: "websearch" })
    .order("published_at", { ascending: false })
    .limit(30);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ articles: data ?? [] });
}
