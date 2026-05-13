"use client";

import { useEffect, useState } from "react";
import { Bookmark, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AppShell } from "@/components/layout/AppShell";
import { NewsCard } from "@/components/feed/NewsCard";
import type { Article } from "@/types";

export default function BookmarksPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from("bookmarks")
        .select(`
          article:articles(
            id, title, url, image_url, summary, published_at, category, coins, is_breaking,
            source:sources(id, name, logo_url, url)
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      const items = (data ?? [])
        .map((b: { article: unknown }) => b.article)
        .filter(Boolean) as Article[];

      setArticles(items);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <AppShell>
      <div className="flex flex-col gap-4">
        <h1 className="text-lg font-bold">Opgeslagen</h1>

        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {!loading && articles.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-20 text-center">
            <Bookmark className="h-12 w-12 text-muted-foreground/30" />
            <p className="text-sm font-medium">Nog niets opgeslagen</p>
            <p className="text-xs text-muted-foreground">
              Sla artikelen op om ze hier terug te vinden.
            </p>
          </div>
        )}

        {!loading && articles.length > 0 && (
          <div className="flex flex-col gap-3">
            {articles.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
