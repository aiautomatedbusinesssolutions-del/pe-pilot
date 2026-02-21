# PE Pilot — Product Requirements Document

> **Spot the bargain. Stick the landing.**

---

## 1. Overview

**Product Name:** PE Pilot
**Type:** Single-page web application (Next.js / React)
**Target User:** Beginner investors who encounter P/E Ratios but lack the context to interpret them.

### Problem

Beginner investors see a stock's P/E Ratio but have no framework to judge whether it signals a good buying opportunity, a fair valuation, or a red flag.

### Solution

PE Pilot is a "Flight Radar" for stock valuation. The user enters a stock ticker, and PE Pilot runs **4 logic checks** against the P/E data, producing a **0–100 Flight Readiness Score** displayed on a central speedometer gauge. Each check lights up as Green, Yellow, or Red — giving an instant, visual verdict.

---

## 2. Core Feature — The 4 Logic Checks

Each check evaluates one dimension of P/E quality. Every check returns one of three states:

| State  | Color   | Points |
|--------|---------|--------|
| Green  | Emerald | 25     |
| Yellow | Amber   | 12     |
| Red    | Rose    | 0      |

**Flight Readiness Score** = sum of all 4 check scores (range 0–100).

---

### 2.1 Sector Map

**Question:** Is this stock's P/E cheap or expensive relative to its sector?

| Condition                              | Result |
|----------------------------------------|--------|
| Stock P/E < Sector Avg P/E            | Green  |
| Stock P/E within ~10% of Sector Avg   | Yellow |
| Stock P/E > Sector Avg P/E by >10%    | Red    |

---

### 2.2 Value Trap Detector

**Question:** Is a low P/E actually a warning sign?

A low P/E can mean the market expects declining earnings — a "value trap."

| Condition                                      | Result |
|------------------------------------------------|--------|
| P/E is low AND EPS growth is positive          | Green  |
| P/E is moderate OR EPS growth is flat (~0%)    | Yellow |
| P/E is low AND EPS growth is negative          | Red    |

---

### 2.3 Trust Meter

**Question:** How much should we trust the forward-looking estimate?

Compares **Trailing P/E** (based on actual reported earnings) vs. **Forward P/E** (based on analyst estimates). A large gap means analysts are making optimistic guesses.

| Condition                                | Result |
|------------------------------------------|--------|
| Gap between Trailing & Forward P/E < 5%  | Green  |
| Gap is 5%–15%                            | Yellow |
| Gap is > 15%                             | Red    |

---

### 2.4 Growth Filter (PEG Ratio)

**Question:** Is a high P/E justified by strong growth?

The PEG Ratio = P/E divided by Earnings Growth Rate. It normalizes P/E against growth.

| Condition      | Result |
|----------------|--------|
| PEG < 1.0      | Green  |
| PEG 1.0–2.0    | Yellow |
| PEG > 2.0      | Red    |

---

## 3. Master Gauge

- **Type:** Central 0–100 speedometer / radial gauge.
- **Scoring:** Each of the 4 checks contributes up to 25 points.
  - Green = 25 pts
  - Yellow = 12 pts
  - Red = 0 pts
- **Max Score:** 100 (all 4 checks Green).
- **Min Score:** 0 (all 4 checks Red).

### Score Interpretation Bands

| Range  | Label              | Gauge Color |
|--------|--------------------|-------------|
| 76–100 | Clear for Takeoff  | Emerald     |
| 41–75  | Turbulence Ahead   | Amber       |
| 0–40   | Grounded           | Rose        |

---

## 4. User Flow

1. User lands on the app — sees the PE Pilot branding and an input field.
2. User types a stock ticker (e.g., `AAPL`) and submits.
3. App fetches P/E data (Trailing P/E, Forward P/E, EPS growth, PEG Ratio, Sector Avg P/E).
4. The 4 logic checks run and each card lights up Green / Yellow / Red.
5. The Master Gauge animates to the computed Flight Readiness Score.
6. User can enter a new ticker to run again.

---

## 5. Technical Stack

| Layer      | Technology                  |
|------------|-----------------------------|
| Framework  | Next.js 16 (App Router)     |
| Language   | TypeScript                  |
| Styling    | Tailwind CSS 4              |
| UI         | React 19                    |
| Data       | Financial API (TBD)         |
| Hosting    | Vercel (planned)            |

---

## 6. Scope Boundaries

### In Scope (MVP)

- Single-page app with ticker input.
- 4 logic check cards with traffic-light color states.
- Central speedometer gauge (0–100).
- Dark-mode-only design per the style guide.

### Out of Scope (Future)

- User accounts / authentication.
- Portfolio tracking or watchlists.
- Historical P/E charting.
- Mobile native app.
- Multi-stock comparison view.

---

## 7. Reference

- Visual design rules: see `Global_Style_Guide.md` in this folder.
