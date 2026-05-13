import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ─── Types ───────────────────────────────────────────────────────────────────

interface RssItem {
  title?: string;
  link?: string;
  contentSnippet?: string;
  enclosure?: { url?: string };
  isoDate?: string;
  pubDate?: string;
}

interface CryptoPanicPost {
  title: string;
  url: string;
  published_at: string;
  currencies?: { code: string }[];
  kind: string;
  is_hot?: boolean;
}

interface ArticleInsert {
  title: string;
  url: string;
  image_url: string | null;
  summary: string | null;
  published_at: string;
  category: string;
  coins: string[];
  is_breaking: boolean;
  source_id: string;
  sentiment: "bullish" | "bearish" | "neutral";
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Naïve RSS fetcher + parser (no external lib needed in Deno). */
async function fetchRss(url: string): Promise<RssItem[]> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "SatWire/1.0 (+https://satwire.app)" },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return [];
    const xml = await res.text();
    return parseRssXml(xml);
  } catch {
    return [];
  }
}

function parseRssXml(xml: string): RssItem[] {
  const items: RssItem[] = [];
  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    items.push({
      title: extractTag(block, "title"),
      link: extractTag(block, "link") || extractAttr(block, "guid"),
      contentSnippet: stripHtml(extractTag(block, "description") ?? ""),
      enclosure: {
        url: extractAttr(block, "enclosure", "url") || extractOgImage(block),
      },
      isoDate: extractTag(block, "pubDate") ?? extractTag(block, "dc:date"),
    });
  }
  return items;
}

function extractTag(block: string, tag: string): string | undefined {
  const match = block.match(
    new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?(.*?)(?:\\]\\]>)?<\/${tag}>`, "si")
  );
  return match?.[1]?.trim();
}

function extractAttr(block: string, tag: string, attr = "url"): string | undefined {
  const match = block.match(
    new RegExp(`<${tag}[^>]*${attr}=["']([^"']+)["']`, "i")
  );
  return match?.[1];
}

function extractOgImage(block: string): string | undefined {
  const match = block.match(/https?:\/\/[^"'\s]+\.(?:jpg|jpeg|png|webp)/i);
  return match?.[0];
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 400);
}

/** Decode common HTML entities so titles are stored clean. */
function decodeEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—")
    .replace(/&nbsp;/g, " ")
    .replace(/&hellip;/g, "…")
    .replace(/&rsquo;/g, "\u2019")
    .replace(/&lsquo;/g, "\u2018")
    .replace(/&rdquo;/g, "\u201C")
    .replace(/&ldquo;/g, "\u201D")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)));
}

/**
 * Heuristic category detection from title + coins.
 */
function detectCategory(title: string, coins: string[]): string {
  const t = title.toLowerCase();
  if (coins.includes("BTC") || t.includes("bitcoin")) return "bitcoin";
  if (coins.includes("ETH") || t.includes("ethereum")) return "ethereum";
  if (t.includes("defi") || t.includes("decentralized finance")) return "defi";
  if (t.includes("nft") || t.includes("non-fungible")) return "nfts";
  if (t.includes("regulat") || t.includes("sec ") || t.includes("cftc") || t.includes("law"))
    return "regulation";
  if (t.includes("market") || t.includes("price") || t.includes("rally") || t.includes("dump"))
    return "market";
  if (t.includes("protocol") || t.includes("layer") || t.includes("upgrade") || t.includes("zkp"))
    return "technology";
  if (coins.length > 0 && !coins.includes("BTC") && !coins.includes("ETH"))
    return "altcoins";
  return "general";
}

// Keyword-based sentiment analysis (no external API cost)
const BULLISH_KW = [
  "rally","surge","soar","breakout","ath","all-time high","record high","bull","bullish",
  "adoption","accumulate","accumulation","gain","gains","pump","moon","recover","recovery",
  "rebound","partnership","launch","listing","upgrade","milestone","approval","approved",
  "institutional","growth","growing","inflow","inflows","optimistic","positive","profit",
];
const BEARISH_KW = [
  "crash","collapse","dump","dumping","plunge","drop","fall","falls","decline","bear","bearish",
  "sell-off","selloff","sell off","hack","hacked","exploit","stolen","rug pull","scam","fraud",
  "ban","banned","restrict","crackdown","lawsuit","sec charges","investigation","fear","panic",
  "loss","losses","outflow","outflows","warning","breach","shutdown","bankrupt","insolvency",
];

function detectSentiment(title: string, summary?: string | null): "bullish" | "bearish" | "neutral" {
  const text = `${title} ${summary ?? ""}`.toLowerCase();
  let b = 0;
  let e = 0;
  for (const kw of BULLISH_KW) if (text.includes(kw)) b++;
  for (const kw of BEARISH_KW) if (text.includes(kw)) e++;
  if (b === e) return "neutral";
  return b > e ? "bullish" : "bearish";
}

/**
 * Checks if a title is too similar to an existing one using Postgres pg_trgm.
 * Returns true if a duplicate is found (similarity >= 0.82).
 */
async function isDuplicate(
  supabase: ReturnType<typeof createClient>,
  title: string
): Promise<boolean> {
  const { data } = await supabase.rpc("is_duplicate_article", { p_title: title });
  return Boolean(data);
}

// ─── Main handler ─────────────────────────────────────────────────────────────

Deno.serve(async (_req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Fetch active sources
  const { data: sources, error: srcErr } = await supabase
    .from("sources")
    .select("id, name, rss_url")
    .eq("active", true);

  if (srcErr || !sources) {
    return new Response(JSON.stringify({ error: srcErr?.message }), { status: 500 });
  }

  const toInsert: ArticleInsert[] = [];
  const errors: string[] = [];

  // ── RSS ingestion ─────────────────────────────────────────────────────────
  for (const source of sources) {
    if (!source.rss_url) continue;
    const items = await fetchRss(source.rss_url);

    for (const item of items.slice(0, 30)) {
      if (!item.title || !item.link) continue;

      const title = decodeEntities(item.title.trim());
      const url = item.link.trim();
      const coins: string[] = [];
      const category = detectCategory(title, coins);
      const publishedAt = item.isoDate
        ? new Date(item.isoDate).toISOString()
        : new Date().toISOString();

      // Skip duplicates
      if (await isDuplicate(supabase, title)) continue;

      toInsert.push({
        title,
        url,
        image_url: item.enclosure?.url || null,
        summary: item.contentSnippet || null,
        published_at: publishedAt,
        category,
        coins,
        is_breaking: false,
        source_id: source.id,
        sentiment: detectSentiment(title, item.contentSnippet),
      });
    }
  }

  // ── CryptoPanic ingestion ─────────────────────────────────────────────────
  const cpKey = Deno.env.get("CRYPTOPANIC_API_KEY");
  if (cpKey) {
    // Find or create a virtual "CryptoPanic" source
    const { data: cpSource } = await supabase
      .from("sources")
      .select("id")
      .eq("name", "CryptoPanic")
      .single();

    let cpSourceId = cpSource?.id;

    if (!cpSourceId) {
      const { data: inserted } = await supabase
        .from("sources")
        .insert({ name: "CryptoPanic", url: "https://cryptopanic.com", active: true })
        .select("id")
        .single();
      cpSourceId = inserted?.id;
    }

    if (cpSourceId) {
      try {
        const cpUrl = `https://cryptopanic.com/api/v1/posts/?auth_token=${cpKey}&public=true&kind=news`;
        const cpRes = await fetch(cpUrl, {
          signal: AbortSignal.timeout(10_000),
        });
        if (cpRes.ok) {
          const cpData = await cpRes.json();
          const posts: CryptoPanicPost[] = cpData.results ?? [];

          for (const post of posts.slice(0, 30)) {
            const title = post.title.trim();
            const coins = (post.currencies ?? []).map((c) => c.code.toUpperCase());
            const category = detectCategory(title, coins);

            if (await isDuplicate(supabase, title)) continue;

            toInsert.push({
              title,
              url: post.url,
              image_url: null,
              summary: null,
              published_at: post.published_at,
              category,
              coins,
              is_breaking: Boolean(post.is_hot),
              source_id: cpSourceId,
              sentiment: detectSentiment(title),
            });
          }
        }
      } catch (e) {
        errors.push(`CryptoPanic: ${e}`);
      }
    }
  }

  // ── Batch upsert (URL is UNIQUE – conflicts are ignored) ──────────────────
  let inserted = 0;
  if (toInsert.length > 0) {
    // Chunk to avoid hitting Supabase row limits per request
    const CHUNK = 50;
    for (let i = 0; i < toInsert.length; i += CHUNK) {
      const chunk = toInsert.slice(i, i + CHUNK);
      const { error } = await supabase
        .from("articles")
        .upsert(chunk, { onConflict: "url", ignoreDuplicates: true });
      if (error) errors.push(error.message);
      else inserted += chunk.length;
    }
  }

  return new Response(
    JSON.stringify({ inserted, errors, total_candidates: toInsert.length }),
    { headers: { "Content-Type": "application/json" } }
  );
});
