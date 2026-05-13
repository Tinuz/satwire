// ─── Core domain types ────────────────────────────────────────────────────────

export type Category =
  | "bitcoin"
  | "ethereum"
  | "altcoins"
  | "defi"
  | "regulation"
  | "nfts"
  | "market"
  | "technology"
  | "general";

export type Sentiment = "bullish" | "bearish" | "neutral";

export interface Source {
  id: string;
  name: string;
  logo_url: string | null;
  url: string;
}

export interface Article {
  id: string;
  title: string;
  url: string;
  image_url: string | null;
  summary: string | null;
  published_at: string; // ISO 8601
  category: Category;
  coins: string[]; // e.g. ["BTC", "ETH"]
  source: Source;
  is_breaking: boolean;
  sentiment: Sentiment;
}

// ─── API / pagination ─────────────────────────────────────────────────────────

export interface FeedPage {
  articles: Article[];
  nextCursor: string | null; // published_at of last item, used for cursor-based pagination
}

export interface ArticleFilters {
  category?: Category | null;
  /** Multiple categories for personalized feed (OR logic) */
  categories?: Category[] | null;
  sourceId?: string | null;
  coin?: string | null;
  /** Multiple coins for personalized feed (OR logic) */
  coins?: string[] | null;
  query?: string | null;
  dateFrom?: string | null;
  dateTo?: string | null;
}

// ─── User preferences ────────────────────────────────────────────────────────

export interface UserPreferences {
  followedCategories: Category[];
  followedCoins: string[];
  pushEnabled: boolean;
}

// ─── Subscriptions ────────────────────────────────────────────────────────────

export type SubscriptionPlan = "free" | "premium";
export type SubscriptionStatus = "active" | "canceled" | "past_due" | "incomplete";

export interface Subscription {
  id: string;
  user_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_end: string | null;
}
