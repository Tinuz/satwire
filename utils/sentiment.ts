import type { Sentiment } from "@/types";

// ─── Keyword lists ────────────────────────────────────────────────────────────

const BULLISH_KEYWORDS = [
  "rally",
  "surge",
  "soar",
  "breakout",
  "ath",
  "all-time high",
  "all time high",
  "record high",
  "bull",
  "bullish",
  "adoption",
  "accumulate",
  "accumulation",
  "buy",
  "buying",
  "gain",
  "gains",
  "pump",
  "moon",
  "mooning",
  "recover",
  "recovery",
  "rebound",
  "partnership",
  "launch",
  "listing",
  "upgrade",
  "milestone",
  "approval",
  "approved",
  "etf approved",
  "institutional",
  "growth",
  "growing",
  "inflow",
  "inflows",
  "outperform",
  "optimistic",
  "positive",
  "profit",
];

const BEARISH_KEYWORDS = [
  "crash",
  "collapse",
  "dump",
  "dumping",
  "plunge",
  "plunging",
  "drop",
  "drops",
  "fall",
  "falls",
  "decline",
  "declining",
  "bear",
  "bearish",
  "sell-off",
  "selloff",
  "sell off",
  "hack",
  "hacked",
  "exploit",
  "stolen",
  "rug pull",
  "rugpull",
  "scam",
  "fraud",
  "ban",
  "banned",
  "restrict",
  "crackdown",
  "lawsuit",
  "sec charges",
  "charges",
  "investigation",
  "fear",
  "panic",
  "loss",
  "losses",
  "outflow",
  "outflows",
  "warning",
  "risk",
  "vulnerable",
  "breach",
  "shutdown",
  "bankrupt",
  "insolvency",
];

/**
 * Detects sentiment from an article title and optional summary.
 * Uses simple keyword matching – no external API cost.
 */
export function detectSentiment(title: string, summary?: string | null): Sentiment {
  const text = `${title} ${summary ?? ""}`.toLowerCase();

  let bullishScore = 0;
  let bearishScore = 0;

  for (const kw of BULLISH_KEYWORDS) {
    if (text.includes(kw)) bullishScore++;
  }
  for (const kw of BEARISH_KEYWORDS) {
    if (text.includes(kw)) bearishScore++;
  }

  if (bullishScore === bearishScore) return "neutral";
  return bullishScore > bearishScore ? "bullish" : "bearish";
}
