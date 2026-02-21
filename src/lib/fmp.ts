import type { StockData } from "./tiingo";
import { deriveMetrics } from "./utils";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface FMPRatiosTTM {
  peRatioTTM: number | null;
  pegRatioTTM: number | null;
  priceToBookRatioTTM: number | null;
}

interface FMPProfile {
  symbol: string;
  companyName: string;
  mktCap: number | null;
}

/** Treat 0 as "no data" but preserve valid negatives. */
function nonZero(v: number | null | undefined): number | null {
  return v != null && v !== 0 ? v : null;
}

function fmpKey(): string {
  const key = process.env.FMP_API_KEY;
  if (!key) throw new Error("FMP API key is not configured");
  return key;
}

/* ------------------------------------------------------------------ */
/*  Profile (company name + market cap)                                */
/* ------------------------------------------------------------------ */
export async function fetchFMPProfile(
  ticker: string,
): Promise<{ companyName: string; marketCap: number | null }> {
  const url = `https://financialmodelingprep.com/api/v3/profile/${encodeURIComponent(ticker)}?apikey=${fmpKey()}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`FMP profile error: ${res.status}`);
  }

  const data: FMPProfile[] = await res.json();

  if (!Array.isArray(data) || !data.length) {
    throw new Error(`No FMP profile for "${ticker}"`);
  }

  return {
    companyName: data[0].companyName,
    marketCap: data[0].mktCap || null,
  };
}

/* ------------------------------------------------------------------ */
/*  Ratios TTM (P/E, PEG, derived metrics)                            */
/* ------------------------------------------------------------------ */
export async function fetchFMP(ticker: string): Promise<StockData> {
  const url = `https://financialmodelingprep.com/api/v3/ratios-ttm/${encodeURIComponent(ticker)}?apikey=${fmpKey()}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`FMP API error: ${res.status}`);
  }

  const data: FMPRatiosTTM[] = await res.json();

  if (!Array.isArray(data) || !data.length) {
    throw new Error(`No FMP data for "${ticker}"`);
  }

  const latest = data[0];
  const peRatio = nonZero(latest.peRatioTTM);
  const pegRatio = nonZero(latest.pegRatioTTM);

  // If both core metrics are missing, this result is useless — let the
  // caller fall through to the secondary engine.
  if (peRatio === null && pegRatio === null) {
    throw new Error(`No usable ratio data from FMP for "${ticker}"`);
  }

  const { epsGrowth, forwardPE } = deriveMetrics(peRatio, pegRatio);

  return {
    ticker: ticker.toUpperCase(),
    companyName: null,
    date: new Date().toISOString(),
    peRatio,
    pegRatio,
    epsGrowth,
    forwardPE,
    marketCap: null,
  };
}
