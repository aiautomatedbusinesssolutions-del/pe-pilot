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
  const apiKey = process.env.NEXT_PUBLIC_TIINGO_API_KEY;
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

  // Derive EPS growth from P/E and PEG
  // PEG = P/E ÷ EPS Growth Rate  →  EPS Growth = P/E ÷ PEG
  let epsGrowth: number | null = null;
  if (peRatio && pegRatio && pegRatio !== 0) {
    epsGrowth = peRatio / pegRatio;
  }

  // Estimate forward P/E from trailing P/E and derived growth
  // Forward P/E ≈ Trailing P/E ÷ (1 + growth/100)
  let forwardPE: number | null = null;
  if (peRatio && epsGrowth && epsGrowth > 0) {
    forwardPE = peRatio / (1 + epsGrowth / 100);
  }

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
