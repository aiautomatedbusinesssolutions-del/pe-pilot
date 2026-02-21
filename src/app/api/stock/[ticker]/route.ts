import { NextResponse } from "next/server";
import { fetchFundamentals } from "@/lib/tiingo";
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

  try {
    const stockData = await fetchFundamentals(ticker);
    const analysis = analyzeStock(stockData);
    return NextResponse.json(analysis);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
