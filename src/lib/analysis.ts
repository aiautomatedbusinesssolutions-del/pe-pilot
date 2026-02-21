import type { StockData } from "./tiingo";

export type CheckState = "green" | "yellow" | "red";

export interface CheckResult {
  title: string;
  state: CheckState;
  explanation: string;
  value: string;
  threshold: string;
}

export interface AnalysisResult {
  ticker: string;
  score: number;
  scoreLabel: string;
  checks: CheckResult[];
  date: string;
}

const POINTS: Record<CheckState, number> = { green: 25, yellow: 12, red: 0 };
const MARKET_AVG_PE = 22;

function scoreLabel(score: number): string {
  if (score >= 76) return "Clear for Takeoff";
  if (score >= 41) return "Turbulence Ahead";
  return "Grounded";
}

/* ------------------------------------------------------------------ */
/*  Check 1 — Sector Map (P/E vs market benchmark)                    */
/* ------------------------------------------------------------------ */
function checkSectorMap(peRatio: number | null): CheckResult {
  const threshold = `S&P Avg: ${MARKET_AVG_PE} P/E`;

  if (peRatio === null || peRatio <= 0) {
    return {
      title: "Sector Map",
      state: "red",
      explanation:
        "P/E ratio is unavailable or negative — the company may not be profitable.",
      value: "N/A",
      threshold,
    };
  }

  const pctAbove = ((peRatio - MARKET_AVG_PE) / MARKET_AVG_PE) * 100;

  if (peRatio < MARKET_AVG_PE) {
    return {
      title: "Sector Map",
      state: "green",
      explanation: `P/E of ${peRatio.toFixed(1)} is below the market average of ${MARKET_AVG_PE}. Priced at a discount relative to the broader market.`,
      value: peRatio.toFixed(1),
      threshold,
    };
  }

  if (pctAbove <= 10) {
    return {
      title: "Sector Map",
      state: "yellow",
      explanation: `P/E of ${peRatio.toFixed(1)} is within 10 % of the market average (${MARKET_AVG_PE}). Roughly fairly valued.`,
      value: peRatio.toFixed(1),
      threshold,
    };
  }

  return {
    title: "Sector Map",
    state: "red",
    explanation: `P/E of ${peRatio.toFixed(1)} is ${pctAbove.toFixed(0)} % above the market average of ${MARKET_AVG_PE}. Trading at a premium.`,
    value: peRatio.toFixed(1),
    threshold,
  };
}

/* ------------------------------------------------------------------ */
/*  Check 2 — Value Trap Detector (P/E level + EPS growth direction)  */
/* ------------------------------------------------------------------ */
function checkValueTrap(
  peRatio: number | null,
  epsGrowth: number | null,
): CheckResult {
  const threshold = "Target: Low P/E + EPS Growth > 0%";

  if (peRatio === null || epsGrowth === null) {
    return {
      title: "Value Trap Detector",
      state: "yellow",
      explanation:
        "Insufficient data to fully assess earnings quality. Proceed with caution.",
      value: "N/A",
      threshold,
    };
  }

  const isLowPE = peRatio < 15;
  const isPositiveGrowth = epsGrowth > 5;
  const isNegativeGrowth = epsGrowth < -5;

  if (isLowPE && isPositiveGrowth) {
    return {
      title: "Value Trap Detector",
      state: "green",
      explanation: `Low P/E (${peRatio.toFixed(1)}) paired with ${epsGrowth.toFixed(1)} % EPS growth. This looks like genuine value — profits are growing alongside a cheap price.`,
      value: `${epsGrowth.toFixed(1)} %`,
      threshold,
    };
  }

  if (isLowPE && isNegativeGrowth) {
    return {
      title: "Value Trap Detector",
      state: "red",
      explanation: `Low P/E (${peRatio.toFixed(1)}) but EPS is declining at ${epsGrowth.toFixed(1)} %. The cheap price may be a warning — possible value trap.`,
      value: `${epsGrowth.toFixed(1)} %`,
      threshold,
    };
  }

  return {
    title: "Value Trap Detector",
    state: "yellow",
    explanation: `P/E of ${peRatio.toFixed(1)} with EPS growth at ${epsGrowth.toFixed(1)} %. Neither a clear bargain nor a red flag.`,
    value: `${epsGrowth.toFixed(1)} %`,
    threshold,
  };
}

/* ------------------------------------------------------------------ */
/*  Check 3 — Trust Meter (trailing vs estimated forward P/E gap)     */
/* ------------------------------------------------------------------ */
function checkTrustMeter(
  peRatio: number | null,
  forwardPE: number | null,
): CheckResult {
  const threshold = "Target: < 5% gap";

  if (peRatio === null || forwardPE === null || forwardPE <= 0) {
    return {
      title: "Trust Meter",
      state: "yellow",
      explanation:
        "Forward P/E estimate is unavailable. Unable to assess the gap between trailing and projected earnings.",
      value: "N/A",
      threshold,
    };
  }

  const gap = Math.abs((peRatio - forwardPE) / peRatio) * 100;

  if (gap < 5) {
    return {
      title: "Trust Meter",
      state: "green",
      explanation: `Trailing P/E (${peRatio.toFixed(1)}) and estimated forward P/E (${forwardPE.toFixed(1)}) are closely aligned — a ${gap.toFixed(1)} % gap. Estimates look trustworthy.`,
      value: `${gap.toFixed(1)} % gap`,
      threshold,
    };
  }

  if (gap <= 15) {
    return {
      title: "Trust Meter",
      state: "yellow",
      explanation: `${gap.toFixed(1)} % gap between trailing P/E (${peRatio.toFixed(1)}) and forward P/E (${forwardPE.toFixed(1)}). Moderate growth is priced in — keep an eye on it.`,
      value: `${gap.toFixed(1)} % gap`,
      threshold,
    };
  }

  return {
    title: "Trust Meter",
    state: "red",
    explanation: `${gap.toFixed(1)} % gap between trailing P/E (${peRatio.toFixed(1)}) and forward P/E (${forwardPE.toFixed(1)}). A large gap means heavy growth expectations — be cautious.`,
    value: `${gap.toFixed(1)} % gap`,
    threshold,
  };
}

/* ------------------------------------------------------------------ */
/*  Check 4 — Growth Filter (PEG Ratio)                              */
/* ------------------------------------------------------------------ */
function checkGrowthFilter(pegRatio: number | null): CheckResult {
  const threshold = "Target: < 1.0 PEG";

  if (pegRatio === null) {
    return {
      title: "Growth Filter",
      state: "yellow",
      explanation: "PEG ratio is not available for this stock.",
      value: "N/A",
      threshold,
    };
  }

  if (pegRatio < 0) {
    return {
      title: "Growth Filter",
      state: "red",
      explanation: `PEG is negative (${pegRatio.toFixed(2)}), indicating declining earnings. The current price is not supported by growth.`,
      value: pegRatio.toFixed(2),
      threshold,
    };
  }

  if (pegRatio < 1.0) {
    return {
      title: "Growth Filter",
      state: "green",
      explanation: `PEG of ${pegRatio.toFixed(2)} is below 1.0 — the growth rate more than justifies the P/E. Potentially undervalued.`,
      value: pegRatio.toFixed(2),
      threshold,
    };
  }

  if (pegRatio <= 2.0) {
    return {
      title: "Growth Filter",
      state: "yellow",
      explanation: `PEG of ${pegRatio.toFixed(2)} is between 1.0 and 2.0. Fairly priced relative to growth.`,
      value: pegRatio.toFixed(2),
      threshold,
    };
  }

  return {
    title: "Growth Filter",
    state: "red",
    explanation: `PEG of ${pegRatio.toFixed(2)} is above 2.0. The price appears too high relative to the earnings growth rate.`,
    value: pegRatio.toFixed(2),
    threshold,
  };
}

/* ------------------------------------------------------------------ */
/*  Main analysis                                                      */
/* ------------------------------------------------------------------ */
export function analyzeStock(data: StockData): AnalysisResult {
  const checks = [
    checkSectorMap(data.peRatio),
    checkValueTrap(data.peRatio, data.epsGrowth),
    checkTrustMeter(data.peRatio, data.forwardPE),
    checkGrowthFilter(data.pegRatio),
  ];

  const score = checks.reduce((sum, c) => sum + POINTS[c.state], 0);

  return {
    ticker: data.ticker,
    score,
    scoreLabel: scoreLabel(score),
    checks,
    date: data.date,
  };
}
