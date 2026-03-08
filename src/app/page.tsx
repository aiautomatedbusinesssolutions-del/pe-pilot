"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Search, ChevronDown, HelpCircle, BookOpen } from "lucide-react";
import type { CheckState, AnalysisResult } from "@/lib/analysis";

/* ------------------------------------------------------------------ */
/*  Glossary definitions (keyed by card title)                         */
/* ------------------------------------------------------------------ */
const glossary: Record<string, string> = {
  "Sector Map":
    "P/E Ratio: Compares a stock's price to its earnings. Lower than peers = potentially cheaper.",
  "Value Trap Detector":
    "EPS Growth: Measures if profits are actually growing — a cheap price with shrinking earnings is a trap.",
  "Trust Meter":
    "Trust Meter: Hype vs. Reality. Compares what a company actually earned to what analysts hope it will earn. A wide gap means the price may be floating on promises.",
  "Growth Filter":
    "PEG Ratio: Growth Bargain Filter. A low price is only good if the company is actually growing. The PEG tells you if you're getting a bargain on that growth.",
};

/* ------------------------------------------------------------------ */
/*  Education Station lessons                                          */
/* ------------------------------------------------------------------ */
const lessons = [
  {
    number: "01",
    title: "The P/E Multiple",
    subtitle: "The \"Price of Admission\"",
    body: "The Price-to-Earnings ratio tells you how much investors are willing to pay for each dollar a company earns. A P/E of 20 means the market pays $20 for every $1 of profit. A lower P/E compared to the market average can signal a bargain — but only if the company is healthy. Think of it as the cover charge: you want to make sure the party inside is worth it.",
  },
  {
    number: "02",
    title: "Value Traps",
    subtitle: "Why Low P/E Isn't Always Good",
    body: "A stock with a P/E of 5 looks like a steal — until you realize earnings are collapsing. The market isn't stupid; a rock-bottom P/E often means investors expect profits to keep falling. This is a \"value trap.\" The key defense? Check EPS growth. If earnings are declining alongside a low P/E, the cheap price is a warning sign, not a buying opportunity.",
  },
  {
    number: "03",
    title: "The Trust Meter",
    subtitle: "The \"Hype Check\"",
    body: "This compares what a company actually earned (Reality) to what analysts hope it will earn (Hype). If the gap is too wide, the stock price might be floating on promises rather than proven results. Don't buy the story, buy the stats.",
  },
  {
    number: "04",
    title: "The PEG Ratio",
    subtitle: "The \"Growth Bargain\"",
    body: "A low price (P/E) is only good if the company is actually growing. The PEG ratio tells you if you are getting a bargain on that growth. It ensures you aren't overpaying for a company that is standing still. Growth is only an asset if the price is right.",
  },
];

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
  if (score >= 76)
    return "CLEAR FOR TAKEOFF: Strong alignment between price and performance.";
  if (score >= 41)
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
/*  Glossary Tooltip                                                   */
/* ------------------------------------------------------------------ */
function GlossaryTip({ term }: { term: string }) {
  const [open, setOpen] = useState(false);
  const text = glossary[term];
  if (!text) return null;

  return (
    <span className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full text-slate-500 transition-colors hover:text-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
        aria-label={`Learn about ${term}`}
      >
        <HelpCircle size={14} />
      </button>

      {open && (
        <span className="absolute bottom-full left-1/2 z-20 mb-2 w-64 -translate-x-1/2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-xs leading-relaxed text-slate-300 shadow-lg">
          {text}
          <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
        </span>
      )}
    </span>
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
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke="#1e293b"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${gap}`}
          className="transition-all duration-700 ease-out"
        />
        <text
          x={cx}
          y={cy - 12}
          textAnchor="middle"
          className="fill-slate-50 text-5xl font-bold"
          style={{ fontSize: 44, fontVariantNumeric: "tabular-nums" }}
        >
          {score}
        </text>
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
    <div
      className="glass flex flex-col justify-between rounded-2xl p-6"
      data-glow={state}
    >
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className={`inline-block h-3 w-3 rounded-full animate-status-pulse ${dotColor[state]}`}
            />
            <h3 className="text-lg font-semibold text-slate-50">
              {title}
              <GlossaryTip term={title} />
            </h3>
          </div>
          <span
            className={`text-sm font-bold tabular-nums ${labelColor[state]}`}
          >
            {value}
          </span>
        </div>
        <p className="text-sm leading-relaxed text-slate-300">{explanation}</p>
      </div>

      <p className="mt-4 border-t border-white/[0.06] pt-3 text-xs text-slate-500">
        {threshold}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Education Station                                                  */
/* ------------------------------------------------------------------ */
function EducationStation() {
  const [open, setOpen] = useState(false);

  return (
    <section className="mt-8">
      {/* Divider */}
      <div className="mb-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700/60 to-transparent" />
        <span className="text-[10px] font-medium uppercase tracking-widest text-slate-600">
          Learn
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700/60 to-transparent" />
      </div>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="glass flex w-full items-center justify-between rounded-2xl px-6 py-4"
      >
        <div className="flex items-center gap-3">
          <BookOpen size={18} className="text-sky-400" />
          <span className="text-sm font-semibold text-slate-50">
            Education Station
          </span>
          <span className="hidden text-xs text-slate-500 sm:inline">
            Bite-sized lessons for beginners
          </span>
        </div>
        <ChevronDown
          size={18}
          className={`text-slate-400 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <div
        className={`grid transition-all duration-300 ease-out ${open ? "mt-4 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
      >
        <div className="overflow-hidden">
          <div className="space-y-3">
            {lessons.map((lesson) => (
              <article key={lesson.number} className="glass rounded-2xl p-6">
                <div className="mb-3 flex items-baseline gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-500/15 text-xs font-bold text-sky-400">
                    {lesson.number}
                  </span>
                  <div>
                    <h4 className="text-base font-semibold text-slate-50">
                      {lesson.title}
                    </h4>
                    <p className="text-xs text-slate-500">{lesson.subtitle}</p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-slate-300">
                  {lesson.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Loading skeleton                                                   */
/* ------------------------------------------------------------------ */
function LoadingSkeleton() {
  return (
    <>
      {/* Gauge card — breathing pulse while "contacting the tower" */}
      <section className="glass mx-auto mb-10 max-w-sm animate-gauge-breathe rounded-2xl p-8">
        <div className="animate-pulse">
          <div className="mx-auto mb-4 h-4 w-32 rounded bg-white/[0.06]" />
          <div className="mx-auto h-40 w-64 rounded bg-white/[0.06]" />
        </div>
      </section>
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass animate-pulse rounded-2xl p-6">
            <div className="mb-3 h-5 w-32 rounded bg-white/[0.06]" />
            <div className="h-4 w-full rounded bg-white/[0.06]" />
            <div className="mt-2 h-4 w-3/4 rounded bg-white/[0.06]" />
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
  const inputRef = useRef<HTMLInputElement>(null);

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
    inputRef.current?.blur(); // dismiss mobile keyboard
    fetchAnalysis(ticker);
  };

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-10">
      <div className="mx-auto max-w-4xl">
        {/* ---- Header ---- */}
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-50">
            PE Pilot
          </h1>
          <p className="mt-1 text-lg text-slate-400">
            Spot the bargain. Stick the landing.
          </p>
        </header>

        {/* ---- Search Bar ---- */}
        <form
          onSubmit={handleSubmit}
          className="relative mx-auto mb-2 max-w-md"
        >
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            ref={inputRef}
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            placeholder="Search Ticker..."
            className="glass w-full rounded-full py-3 pl-11 pr-10 text-sm uppercase text-slate-50 placeholder-slate-500 outline-none transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500/40"
          />
          {loading && <Spinner />}
        </form>
        <p className="mx-auto mb-10 max-w-md text-center text-[11px] text-slate-600">
          Best results: DOW 30 &amp; Large Cap stocks (API Limit)
        </p>

        {/* ---- Error ---- */}
        {error && (
          <div className="mx-auto mb-10 max-w-sm rounded-2xl border border-rose-800/50 bg-rose-900/20 p-6 text-center">
            <p className="text-sm text-rose-300">{error}</p>
          </div>
        )}

        {/* ---- Loading ---- */}
        {loading && <LoadingSkeleton />}

        {/* ---- Results (fade-in on load) ---- */}
        {!loading && result && (
          <div key={result.ticker + result.date} className="animate-fade-in">
            {/* Ticker + Company Name */}
            <div className="mb-6 text-center">
              <div className="flex items-center justify-center gap-3">
                <span className="glass inline-block rounded-full px-4 py-1 text-sm font-bold text-slate-50">
                  {result.ticker}
                </span>
                {result.companyName && (
                  <h2 className="text-xl font-semibold text-slate-200">
                    {result.companyName}
                  </h2>
                )}
              </div>
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
            <section className="glass mx-auto mb-4 max-w-sm rounded-2xl p-8">
              <h2 className="mb-4 text-center text-sm font-medium uppercase tracking-wider text-slate-500">
                Flight Readiness
              </h2>
              <Gauge score={result.score} label={result.scoreLabel} />
            </section>

            {/* ---- Pilot's Briefing ---- */}
            <p
              className={`mx-auto mb-10 max-w-md text-center text-base font-bold tracking-wide ${labelColor[scoreToState(result.score)]}`}
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

            {/* ---- Education Station ---- */}
            <EducationStation />
          </div>
        )}
      </div>
    </div>
  );
}
