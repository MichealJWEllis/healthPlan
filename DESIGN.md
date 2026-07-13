# Design

Captured from the live code (tracker.html carries the fullest system; index.html and workout.html share the nav and surface vocabulary).

## Theme

Dark, single theme. Page background is a vertical gradient `#070b14 → #0b1220`. Content sits on translucent white panels over that gradient. No light mode.

## Color

| Role | Value | Use |
|---|---|---|
| bg | `#0b1220` (gradient from `#070b14`) | page surface |
| text | `#e9eefc` | primary text |
| muted | `#9fb0d0` | labels, subtext, table headers |
| line | `rgba(255,255,255,.10)` | borders, dividers |
| accent / blue | `#6ea8ff` | primary actions, selection, workout dot, lean mass, links |
| green | `#4ade80` | success, weight loss, meal dot, completed days, fasting ring |
| yellow / amber | `#fbbf24` | body fat, weigh-in dot, streak badge, caution |
| red | `#f87171` | weight gain, destructive (end fast), errors |
| purple | `#c084fc` | fasted-day dot |
| panel | `rgba(255,255,255,.03)` | sections |
| panel2 | `rgba(255,255,255,.05)` | cards, inputs, tracks |

Strategy: Restrained. Tinted dark neutrals with the blue accent on actions and state; green/amber/red are semantic (good/watch/bad), purple is the fasting mark.

## Typography

- Stack: `system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif`. One family everywhere.
- h1 `clamp(20px→30px)` w500 · h2 `1rem` w500 · KPI value `1.4rem` · body `1rem` · sub/labels `0.82rem` · micro labels `0.70–0.72rem` uppercase with letter-spacing.
- Numbers in timers use `font-variant-numeric: tabular-nums`.

## Shape & Elevation

- Radii: sections 16px, cards/inputs 12px, small controls 8px, pills/buttons 999px, calendar cells 10px.
- Borders (1px `--line`) do the separation work; no shadows.

## Components

- **Section panel**: `--panel` bg, 1px line border, 16px radius, 18px padding.
- **KPI card**: `--panel2`, uppercase micro label, large value, unit subline.
- **Primary button**: accent bg, dark text `#0b1220`, w700, 8px radius.
- **Pill button (.btn)**: transparent, 1px border, 999px radius.
- **Habit button**: large tappable card with emoji icon, done-state flips to green tint + green border.
- **Progress**: horizontal bars (green/amber fills), Chart.js doughnut (body comp), SVG ring with `stroke-dashoffset` (fasting stages), 7×N commitment grid, 4-week dot calendar (blue/green/yellow/purple dots).
- **Tables**: muted uppercase headers, row borders only, last column right-aligned.
- **Inputs**: `--panel2` bg, 1px border, accent border on focus, `color-scheme: dark`.

## Motion

Sparse: 0.2s background/border transitions on buttons, 0.5s ease width/dashoffset on progress fills, Chart.js defaults. Nothing orchestrated.

## Layout

- Full-width container, `clamp(16px, 2.5vw, 40px)` side padding.
- Tracker top grid: `220px 220px 1fr` (donut · fasting ring · KPIs+bars), collapsing at 980px and 640px.
- Pill nav (Tracker / Meal Plan / Workout) shared across pages; active pill filled with accent.
