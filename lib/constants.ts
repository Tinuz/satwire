import type { Category } from "@/types";

export const CATEGORIES: { label: string; value: Category | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Bitcoin", value: "bitcoin" },
  { label: "Ethereum", value: "ethereum" },
  { label: "Altcoins", value: "altcoins" },
  { label: "DeFi", value: "defi" },
  { label: "Market", value: "market" },
  { label: "Regulation", value: "regulation" },
  { label: "Technology", value: "technology" },
  { label: "NFTs", value: "nfts" },
  { label: "General", value: "general" },
];

/** Colour classes per category (Tailwind) */
export const CATEGORY_COLORS: Record<string, string> = {
  bitcoin: "bg-orange-500/15 text-orange-400 border-orange-500/20",
  ethereum: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  altcoins: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  defi: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
  regulation: "bg-red-500/15 text-red-400 border-red-500/20",
  nfts: "bg-pink-500/15 text-pink-400 border-pink-500/20",
  market: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  technology: "bg-indigo-500/15 text-indigo-400 border-indigo-500/20",
  general: "bg-zinc-500/15 text-zinc-400 border-zinc-500/20",
};

export const PAGE_SIZE = 20;

/** Displayed list of news sources (for settings page / about) */
export const NEWS_SOURCES = [
  "CoinTelegraph",
  "CoinDesk",
  "Decrypt",
  "The Block",
  "Bitcoin Magazine",
  "BeInCrypto",
  "Blockworks",
  "NewsBTC",
  "The Defiant",
  "CryptoSlate",
  "AMBCrypto",
  "U.Today",
  "CoinGape",
  "Crypto Briefing",
  "Bitcoin.com News",
  "DL News",
  "Unchained",
  "Protos",
  "CoinJournal",
  "Crypto News",
  "CryptoPanic",
];
