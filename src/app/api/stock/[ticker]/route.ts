import { NextResponse } from "next/server";
import { fetchFMP, fetchFMPProfile } from "@/lib/fmp";
import { fetchFundamentals } from "@/lib/tiingo";
import type { StockData } from "@/lib/tiingo";
import { analyzeStock } from "@/lib/analysis";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ ticker: string }> },
) {
  const { ticker } = await params;

  if (!ticker || ticker.length > 10) {
    return NextResponse.json(
      { error: "Invalid ticker symbol" },
      { status: 400 },
    );
  }

  // ---- Step 1: Fetch company identity from FMP profile ----
  let companyName: string | null = null;
  let profileMarketCap: number | null = null;

  try {
    const profile = await fetchFMPProfile(ticker);
    companyName = profile.companyName;
    profileMarketCap = profile.marketCap;
  } catch {
    // Profile is optional — continue without it
  }

  // ---- Step 2: Primary engine — FMP ratios ----
  try {
    const stockData = await fetchFMP(ticker);
    stockData.companyName = companyName;
    stockData.marketCap = stockData.marketCap ?? profileMarketCap;
    return NextResponse.json(analyzeStock(stockData));
  } catch {
    // Silent fail — fall through to secondary engine
  }

  // ---- Step 3: Secondary engine — Tiingo ----
  try {
    const stockData = await fetchFundamentals(ticker);
    stockData.companyName = companyName;
    return NextResponse.json(analyzeStock(stockData));
  } catch {
    // Silent fail — both ratio engines exhausted
  }

  // ---- Step 4: Graceful Data Gap (we know the company but have no ratios) ----
  if (companyName) {
    const gapData: StockData = {
      ticker: ticker.toUpperCase(),
      companyName,
      date: new Date().toISOString(),
      peRatio: null,
      pegRatio: null,
      epsGrowth: null,
      forwardPE: null,
      marketCap: profileMarketCap,
    };
    return NextResponse.json(analyzeStock(gapData));
  }

  // ---- Step 5: Total failure — unknown ticker ----
  return NextResponse.json(
    {
      error:
        "Ticker data currently unavailable. Please try a major US stock.",
    },
    { status: 404 },
  );
}
