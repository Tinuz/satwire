"use client";

import { memo, useEffect, useState } from "react";
import Link from "next/link";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CoinPrice } from "@/app/api/prices/route";

function formatPrice(price: number): string {
  if (price >= 1000) return price.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (price >= 1) return price.toLocaleString("en-US", { maximumFractionDigits: 2 });
  return price.toLocaleString("en-US", { maximumFractionDigits: 4 });
}

// Memoized strip — only re-renders when prices meaningfully change,
// so the CSS animation never resets during a periodic refresh.
const TickerStrip = memo(function TickerStrip({ prices }: { prices: CoinPrice[] }) {
  // Duplicate for a seamless loop; 5s per unique coin keeps all coins visible
  const items = [...prices, ...prices];
  const duration = Math.max(20, prices.length * 5);

  return (
    <div
      // inline-flex: track is exactly as wide as its content — no flex-shrink crushing items
      className="inline-flex items-center whitespace-nowrap py-1.5"
      style={{ animation: `ticker ${duration}s linear infinite`, willChange: "transform" }}
    >
      {items.map((coin, i) => (
        <Link
          key={`${coin.id}-${i}`}
          href={`/feed?coin=${coin.symbol}`}
          className="inline-flex items-center gap-2 px-5 text-xs hover:opacity-80 transition-opacity"
        >
          <span className="font-mono font-semibold text-foreground/80">{coin.symbol}</span>
          <span className="font-mono text-foreground/60">${formatPrice(coin.price)}</span>
          <span
            className={cn(
              "flex items-center gap-0.5 font-mono font-medium",
              coin.change24h >= 0 ? "text-emerald-400" : "text-red-400"
            )}
          >
            {coin.change24h >= 0 ? (
              <TrendingUp className="h-2.5 w-2.5" />
            ) : (
              <TrendingDown className="h-2.5 w-2.5" />
            )}
            {Math.abs(coin.change24h).toFixed(2)}%
          </span>
          <span className="text-white/10 pl-1">·</span>
        </Link>
      ))}
    </div>
  );
}, (prev, next) => {
  // Only skip re-render when prices AND changes are identical (avoid animation reset on unrelated renders)
  if (prev.prices.length !== next.prices.length) return false;
  return prev.prices.every((p, i) => {
    const n = next.prices[i];
    return p.id === n?.id && p.price === n?.price && p.change24h === n?.change24h;
  });
});

export function PriceTicker() {
  const [prices, setPrices] = useState<CoinPrice[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function fetchPrices() {
      try {
        const res = await fetch("/api/prices");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && data.prices?.length > 0) {
          setPrices(data.prices);
        }
      } catch {
        // silent — ticker is non-critical
      }
    }

    fetchPrices();
    const interval = setInterval(fetchPrices, 60_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (prices.length === 0) return null;

  return (
    <div
      className="w-full overflow-hidden border-b border-white/[0.04] bg-black/40"
      aria-label="Live crypto prijzen"
    >
      <TickerStrip prices={prices} />
    </div>
  );
}
