import { deriveMetrics } from "./utils";

export interface TiingoDailyData {
  date: string;
  marketCap: number | null;
  enterpriseVal: number | null;
  peRatio: number | null;
  pbRatio: number | null;
  trailingPEG1Y: number | null;
}

export interface StockData {
  ticker: string;
  companyName: string | null;
  date: string;
  peRatio: number | null;
  pegRatio: number | null;
  epsGrowth: number | null;
  forwardPE: number | null;
  marketCap: number | null;
}

export async function fetchFundamentals(ticker: string): Promise<StockData> {
  const apiKey = process.env.TIINGO_API_KEY;
  if (!apiKey) {
    throw new Error("Tiingo API key is not configured");
  }

  const url = `https://api.tiingo.com/tiingo/fundamentals/${encodeURIComponent(ticker)}/daily?token=${apiKey}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    if (res.status === 404) throw new Error(`Ticker "${ticker}" not found`);
    if (res.status === 401) throw new Error("Invalid API key");
    throw new Error(`Tiingo API error: ${res.status}`);
  }

  const data: TiingoDailyData[] = await res.json();

  if (!data.length) {
    throw new Error(`No fundamental data available for "${ticker}"`);
  }

  const latest = data[data.length - 1];

  const peRatio = latest.peRatio;
  const pegRatio = latest.trailingPEG1Y;
  const { epsGrowth, forwardPE } = deriveMetrics(peRatio, pegRatio);

  return {
    ticker: ticker.toUpperCase(),
    companyName: null,
    date: latest.date,
    peRatio,
    pegRatio,
    epsGrowth,
    forwardPE,
    marketCap: latest.marketCap,
  };
}
