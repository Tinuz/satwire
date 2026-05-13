import { NextResponse } from "next/server";

export const runtime = "edge";

const PAIRS = [
  "BTCUSDT",
  "ETHUSDT",
  "SOLUSDT",
  "BNBUSDT",
  "XRPUSDT",
  "ADAUSDT",
  "AVAXUSDT",
  "DOGEUSDT",
  "DOTUSDT",
  "MATICUSDT",
];

const SYMBOL_MAP: Record<string, string> = {
  BTCUSDT: "BTC",
  ETHUSDT: "ETH",
  SOLUSDT: "SOL",
  BNBUSDT: "BNB",
  XRPUSDT: "XRP",
  ADAUSDT: "ADA",
  AVAXUSDT: "AVAX",
  DOGEUSDT: "DOGE",
  DOTUSDT: "DOT",
  MATICUSDT: "POL",
};

// CoinGecko id for sitemap/article links (kept for backwards compat)
const COINGECKO_ID: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
  BNB: "binancecoin",
  XRP: "ripple",
  ADA: "cardano",
  AVAX: "avalanche-2",
  DOGE: "dogecoin",
  DOT: "polkadot",
  POL: "matic-network",
};

export interface CoinPrice {
  id: string;
  symbol: string;
  price: number;
  change24h: number;
}

export async function GET() {
  try {
    const symbolsParam = encodeURIComponent(JSON.stringify(PAIRS));
    const url = `https://api.binance.com/api/v3/ticker/24hr?symbols=${symbolsParam}&type=MINI`;

    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8_000),
    });

    if (!res.ok) {
      throw new Error(`Binance ${res.status}`);
    }

    const data = await res.json() as Array<{
      symbol: string;
      lastPrice: string;
      openPrice: string;
    }>;

    const prices: CoinPrice[] = data.map((item) => {
      const sym = SYMBOL_MAP[item.symbol] ?? item.symbol.replace("USDT", "");
      const last = parseFloat(item.lastPrice);
      const open = parseFloat(item.openPrice);
      const change24h = open > 0 ? ((last - open) / open) * 100 : 0;
      return {
        id: COINGECKO_ID[sym] ?? sym.toLowerCase(),
        symbol: sym,
        price: last,
        change24h,
      };
    }).filter((c) => c.price > 0);

    return NextResponse.json({ prices }, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch prices" }, { status: 500 });
  }
}

