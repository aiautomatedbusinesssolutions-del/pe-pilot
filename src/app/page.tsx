"use client";

import { useState, useEffect, useCallback } from "react";
import { Search } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
type CheckState = "green" | "yellow" | "red";

interface CheckResult {
  title: string;
  state: CheckState;
  explanation: string;
  value: string;
  threshold: string;
}

interface AnalysisResult {
  ticker: string;
  score: number;
  scoreLabel: string;
  checks: CheckResult[];
  date: string;
}

/* ------------------------------------------------------------------ */
/*  Color maps                                                         */
/* ------------------------------------------------------------------ */
const dotColor = {
  green: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]",
  yellow: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]",
  red: "bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.5)]",
};

const labelColor = {
  green: "text-emerald-400",
  yellow: "text-amber-400",
  red: "text-rose-400",
};

/* ------------------------------------------------------------------ */
/*  Pilot's Briefing copy                                              */
/* ------------------------------------------------------------------ */
function briefingText(score: number): string {
  if (score >= 71)
    return "CLEAR FOR TAKEOFF: Strong alignment between price and performance.";
  if (score >= 31)
    return "TURBULENCE: Mixed signals. Requires further due diligence.";
  return "GROUNDED: Significant valuation or growth risks detected.";
}

/* ------------------------------------------------------------------ */
/*  Inline SVG spinner (shown inside search bar while loading)         */
/* ------------------------------------------------------------------ */
function Spinner() {
  return (
    <svg
      className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin-slow text-slate-400"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        className="opacity-25"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Gauge                                                              */
/* ------------------------------------------------------------------ */
function scoreToState(s: number) {
  if (s >= 76) return "green" as const;
  if (s >= 41) return "yellow" as const;
  return "red" as const;
}

const gaugeArcColor = {
  green: "#34d399",
  yellow: "#fbbf24",
  red: "#fb7185",
};

function Gauge({ score, label }: { score: number; label: string }) {
  const state = scoreToState(score);
  const color = gaugeArcColor[state];

  const radius = 90;
  const cx = 100;
  const cy = 100;
  const circumference = Math.PI * radius;
  const filled = (score / 100) * circumference;
  const gap = circumference - filled;

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 120" className="w-64 sm:w-72 md:w-80">
        {/* Background arc */}
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke="#1e293b"
          strokeWidth="14"
          strokeLinecap="round"
        />
        {/* Filled arc */}
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${gap}`}
          className="transition-all duration-700 ease-out"
        />
        {/* Score text */}
        <text
          x={cx}
          y={cy - 12}
          textAnchor="middle"
          className="fill-slate-50 text-5xl font-bold"
          style={{ fontSize: 44, fontVariantNumeric: "tabular-nums" }}
        >
          {score}
        </text>
        {/* /100 label */}
        <text
          x={cx}
          y={cy + 10}
          textAnchor="middle"
          className="fill-slate-500"
          style={{ fontSize: 14 }}
        >
          / 100
        </text>
      </svg>

      <p
        className={`mt-1 text-sm font-medium uppercase tracking-wider ${labelColor[state]}`}
      >
        Status: {label}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Check Card                                                         */
/* ------------------------------------------------------------------ */
function CheckCard({
  title,
  state,
  explanation,
  value,
  threshold,
}: {
  title: string;
  state: CheckState;
  explanation: string;
  value: string;
  threshold: string;
}) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900 p-6 transition-colors hover:border-slate-700">
      {/* Header row */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className={`inline-block h-3 w-3 rounded-full animate-status-pulse ${dotColor[state]}`}
            />
            <h3 className="text-lg font-semibold text-slate-50">{title}</h3>
          </div>
          <span
            className={`text-sm font-medium tabular-nums ${labelColor[state]}`}
          >
            {value}
          </span>
        </div>
        <p className="text-sm leading-relaxed text-slate-400">{explanation}</p>
      </div>

      {/* Threshold label */}
      <p className="mt-4 border-t border-slate-800 pt-3 text-xs text-slate-500">
        {threshold}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Loading skeleton                                                   */
/* ------------------------------------------------------------------ */
function LoadingSkeleton() {
  return (
    <>
      <section className="mx-auto mb-10 max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-8">
        <div className="animate-pulse">
          <div className="mx-auto mb-4 h-4 w-32 rounded bg-slate-800" />
          <div className="mx-auto h-40 w-64 rounded bg-slate-800" />
        </div>
      </section>
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl border border-slate-800 bg-slate-900 p-6"
          >
            <div className="mb-3 h-5 w-32 rounded bg-slate-800" />
            <div className="h-4 w-full rounded bg-slate-800" />
            <div className="mt-2 h-4 w-3/4 rounded bg-slate-800" />
          </div>
        ))}
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function Home() {
  const [ticker, setTicker] = useState("AAPL");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = useCallback(async (symbol: string) => {
    const cleaned = symbol.trim().toUpperCase();
    if (!cleaned) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/stock/${encodeURIComponent(cleaned)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch stock data");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalysis("AAPL");
  }, [fetchAnalysis]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAnalysis(ticker);
  };

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-10">
      <div className="mx-auto max-w-4xl">
        {/* ---- Header ---- */}
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-slate-50">PE Pilot</h1>
          <p className="mt-1 text-lg text-slate-400">
            Spot the bargain. Stick the landing.
          </p>
        </header>

        {/* ---- Search Bar ---- */}
        <form
          onSubmit={handleSubmit}
          className="relative mx-auto mb-10 max-w-md"
        >
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            placeholder="Search Ticker..."
            className="w-full rounded-full border border-slate-800 bg-slate-900 py-3 pl-11 pr-10 text-sm uppercase text-slate-50 placeholder-slate-500 outline-none transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-950"
          />
          {loading && <Spinner />}
        </form>

        {/* ---- Error ---- */}
        {error && (
          <div className="mx-auto mb-10 max-w-sm rounded-2xl border border-rose-800/50 bg-rose-900/20 p-6 text-center">
            <p className="text-sm text-rose-400">{error}</p>
          </div>
        )}

        {/* ---- Loading ---- */}
        {loading && <LoadingSkeleton />}

        {/* ---- Results (fade-in on load) ---- */}
        {!loading && result && (
          <div key={result.ticker + result.date} className="animate-fade-in">
            {/* Ticker badge + data date */}
            <div className="mb-6 text-center">
              <span className="inline-block rounded-full border border-slate-700 bg-slate-900 px-4 py-1 text-sm font-medium text-slate-50">
                {result.ticker}
              </span>
              {result.date && (
                <p className="mt-2 text-xs text-slate-500">
                  Data as of{" "}
                  {new Date(result.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              )}
            </div>

            {/* ---- Master Gauge ---- */}
            <section className="mx-auto mb-4 max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-8">
              <h2 className="mb-4 text-center text-sm font-medium uppercase tracking-wider text-slate-500">
                Flight Readiness
              </h2>
              <Gauge score={result.score} label={result.scoreLabel} />
            </section>

            {/* ---- Pilot's Briefing ---- */}
            <p
              className={`mx-auto mb-10 max-w-sm text-center text-sm font-medium ${labelColor[scoreToState(result.score)]}`}
            >
              {briefingText(result.score)}
            </p>

            {/* ---- 4 Check Cards (2×2 grid) ---- */}
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {result.checks.map((c) => (
                <CheckCard
                  key={c.title}
                  title={c.title}
                  state={c.state}
                  explanation={c.explanation}
                  value={c.value}
                  threshold={c.threshold}
                />
              ))}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
