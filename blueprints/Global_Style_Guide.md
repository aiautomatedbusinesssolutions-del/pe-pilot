# PE Pilot — Global Style Guide

---

## 1. Theme

PE Pilot uses a **dark-mode-only** design. There is no light mode toggle.

---

## 2. Color Palette

### Base Colors

| Token            | Tailwind Class    | Hex       | Usage                        |
|------------------|-------------------|-----------|------------------------------|
| Background       | `bg-slate-950`    | `#020617` | Page / app background        |
| Card Background  | `bg-slate-900`    | `#0f172a` | All card surfaces            |
| Card Border      | `border-slate-800`| `#1e293b` | Card borders                 |
| Primary Text     | `text-slate-50`   | `#f8fafc` | Headings, key values         |
| Secondary Text   | `text-slate-400`  | `#94a3b8` | Labels, descriptions         |
| Muted Text       | `text-slate-500`  | `#64748b` | Footnotes, disabled states   |

### Traffic Light Colors (Status Indicators)

| State   | Token    | Tailwind Class  | Hex       | Usage                          |
|---------|----------|-----------------|-----------|--------------------------------|
| Success | Emerald  | `text-emerald-400` / `bg-emerald-400` | `#34d399` | Green checks, positive gauge   |
| Warning | Amber    | `text-amber-400` / `bg-amber-400`     | `#fbbf24` | Yellow checks, caution gauge   |
| Danger  | Rose     | `text-rose-400` / `bg-rose-400`       | `#fb7185` | Red checks, negative gauge     |

### Accent (Interactive Elements)

| Token            | Tailwind Class    | Hex       | Usage                        |
|------------------|-------------------|-----------|------------------------------|
| Accent           | `bg-sky-500`      | `#0ea5e9` | Buttons, active input border |
| Accent Hover     | `bg-sky-400`      | `#38bdf8` | Button hover state           |

---

## 3. Typography

| Element          | Classes                                          |
|------------------|--------------------------------------------------|
| App Title        | `text-3xl font-bold text-slate-50`               |
| Subtitle         | `text-lg text-slate-400`                         |
| Card Title       | `text-lg font-semibold text-slate-50`            |
| Card Body        | `text-sm text-slate-400`                         |
| Score Value      | `text-5xl font-bold tabular-nums`                |
| Score Label      | `text-sm font-medium uppercase tracking-wider`   |

Font family: Geist Sans (already configured in the project via `next/font/google`).

---

## 4. Card Component Rules

```
┌─────────────────────────────────┐
│  bg-slate-900                   │
│  border border-slate-800        │
│  rounded-2xl                    │
│  p-6                            │
│  shadow: none (flat design)     │
└─────────────────────────────────┘
```

- All cards use `rounded-2xl` corners.
- No drop shadows — flat, border-defined surfaces.
- Padding: `p-6` standard, `p-8` for the master gauge card.

---

## 5. Traffic Light Indicator Rules

Each logic check card displays a colored status dot or badge:

| State   | Dot Classes                                    |
|---------|------------------------------------------------|
| Green   | `bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]` |
| Yellow  | `bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]`   |
| Red     | `bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.5)]`    |

The glow shadow is the only exception to the "no shadows" rule — it reinforces the traffic-light metaphor.

---

## 6. Master Gauge

- **Type:** Radial / semicircle speedometer.
- **Size:** Prominent, centered on the page above or beside the check cards.
- **Needle / arc color:** Matches the score band:
  - 76–100 → Emerald (`#34d399`)
  - 41–75 → Amber (`#fbbf24`)
  - 0–40 → Rose (`#fb7185`)
- **Background arc:** `slate-800` (`#1e293b`).
- **Score number:** Displayed large in the center of the gauge.

---

## 7. Spacing & Layout

| Token        | Value    | Usage                           |
|--------------|----------|---------------------------------|
| Page padding | `px-6`   | Mobile side padding             |
| Max width    | `max-w-4xl` | Content container            |
| Card gap     | `gap-4`  | Between adjacent cards          |
| Section gap  | `gap-8`  | Between major sections          |

---

## 8. Interaction States

| State    | Rule                                              |
|----------|---------------------------------------------------|
| Hover    | Lighten border to `border-slate-700`              |
| Focus    | Ring: `ring-2 ring-sky-500 ring-offset-2 ring-offset-slate-950` |
| Disabled | Opacity: `opacity-50 cursor-not-allowed`          |
| Loading  | Pulse animation on card content area              |

---

## 9. Do's and Don'ts

**Do:**
- Use the traffic light colors ONLY for status indicators (Green/Yellow/Red results).
- Keep all backgrounds in the slate-900/950 range.
- Use `tabular-nums` for any numeric display so digits align.

**Don't:**
- Use white (`#ffffff`) backgrounds anywhere.
- Use traffic light colors for decorative purposes.
- Add gradients or complex shadows beyond the status glow.
- Mix light-mode and dark-mode patterns.
