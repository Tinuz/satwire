import { formatDistanceToNow, parseISO } from "date-fns";
import { nl } from "date-fns/locale";

/**
 * Returns a relative time string in Dutch (e.g. "5 minuten geleden").
 */
export function timeAgo(isoString: string): string {
  try {
    return formatDistanceToNow(parseISO(isoString), {
      addSuffix: true,
      locale: nl,
    });
  } catch {
    return "";
  }
}

/**
 * Extracts the root domain from a URL for display (e.g. "cointelegraph.com").
 */
export function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/**
 * Truncates a string to `maxLength` characters, appending "…" if truncated.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength).trimEnd() + "…";
}

/** Common HTML entities found in RSS feed titles / descriptions. */
const HTML_ENTITIES: Record<string, string> = {
  "&amp;":   "&",
  "&lt;":    "<",
  "&gt;":    ">",
  "&quot;":  '"',
  "&#39;":   "'",
  "&apos;":  "'",
  "&ndash;": "–",
  "&mdash;": "—",
  "&lsquo;": "\u2018",
  "&rsquo;": "\u2019",
  "&ldquo;": "\u201C",
  "&rdquo;": "\u201D",
  "&hellip;":"…",
  "&nbsp;":  " ",
};

/**
 * Decodes HTML entities (both named and numeric) in a plain-text string.
 * Safe to call on already-decoded text (idempotent for normal strings).
 */
export function decodeEntities(str: string): string {
  return str
    // Named entities
    .replace(/&[a-z]+;/gi, (m) => HTML_ENTITIES[m] ?? m)
    // Decimal numeric entities  &#8217;
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    // Hex numeric entities  &#x2019;
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)));
}

