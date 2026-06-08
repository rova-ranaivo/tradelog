# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Two-track codebase

This repo has two parallel versions of the app:

| Track | Path | Status |
|---|---|---|
| **Vanilla (active)** | `index.html` (~3500 lines) | Production — all features live here |
| **React migration** | `src/` + `vite.config.ts` | In progress — only dashboard & journal partially migrated |

**When adding features, always edit `index.html` unless explicitly asked to work on the React version.**

## Running the app

```bash
# Vanilla version — just open in browser (no build step)
start index.html

# React version (Vite + TypeScript)
npm run dev       # dev server
npm run build     # tsc + vite build (outputs to dist/)
npm run preview   # preview built output
```

No linter or test suite configured.

## index.html architecture

Everything lives in one file: CSS in `<style>`, markup in `<body>`, all logic in one `<script>` block starting around line 1564.

### Global state

```js
DB = { trades, accounts, cashflow, tags, instruments, rules, checklists }
jFilters = { session, instrument, resultat, dateFrom, dateTo, period, rNonProfitable, horsSession }
jAccFilters = Set<accountName|'all'>
dashFilters, dashPeriod, dashCustomFrom, dashCustomTo
```

### Data flow

1. `loadApp()` → fetches all Supabase tables in parallel → populates `DB`
2. Each page has a top-level `render*()` function: `renderDash()`, `renderJournal()`, `renderCalendar()`, etc.
3. `renderJournal()` calls `renderJAccPills()` → `renderJFilters()` → `renderJSummary()` → `renderJTable()`
4. `getFT()` is the single source of truth for filtered journal trades — always use it, never filter `DB.trades` directly in render functions

### Key helpers

| Function | Purpose |
|---|---|
| `getFT()` | Returns filtered + sorted journal trades |
| `calcRR(t)` | Compute R:R from gainPerte / montantRisque |
| `calcSession(heure)` | Derive session label from HH:MM |
| `calcHorsZone(heure)` | True if outside killzones (GMT+4: London 11-14h, NY 16:30-19:30) |
| `isHorsSession(heure)` | True if outside sessions (GMT+4: London 10-13h, NY 16:30-19h) |
| `isRNonProfitable(t)` | True if stars ≤ 3 |
| `getAuditReasons(t)` | Array of discipline failure reasons for tooltip |
| `dc(id)` | Destroy Chart.js instance before re-render |
| `esc(s)` | HTML-escape a string |
| `fmtD(d)` / `fmtN(n,dec)` | Date and number formatting |

### Supabase tables

`trades`, `accounts`, `cashflow`, `tags` — accessed via `sbLoad*()` / `sbSave*()` helpers. Credentials come from `localStorage` (set in Settings page).

### Trade object fields

```
id, compte, date, heure (HH:MM), session, instrument, direction,
structure ('solide'|'fragile'|null), horsZone (bool), stars (1-5),
montantRisque, gainPerte, rr, resultat, etat,
pourquoiEntrer, douteHesitation, screenshotAvant, screenshotApres, tags[]
```

Backward-compat: old `structureSolide` (bool) → `structure` (string); old `confiance` (1-10) → `stars` (1-5) via `Math.round(confiance/2)`.

### Dual theme system

- Dark (default): `body` has no class. Light: `body.light`
- Toggle: `toggleTheme()` / `setTheme('light'|'dark')`
- Always use `var(--token)` — never hard-coded colors
- Key tokens: `--bg`, `--green`, `--red`, `--accent`, `--amber`, `--blue`, `--purple`, `--text`…`--text4`, `--surface`…`--surface3`, `--border`, `--border2`
- Each color has `--X`, `--X-bg`, `--X-bd` variants for badges/highlights

### Charts

Chart.js 4.4 instances stored in `charts{}` object. Always call `dc(id)` before rendering into a canvas that may already exist.

### AI Coach

`fetchAIInterpretation(trades)` — Gemini 2.5-flash, 6h cache in `localStorage.tl_ai_cache`. API key in `localStorage.gemini_api_key`.

## Killzone vs Session distinction

Two separate concepts with different time ranges:

- **Killzone** (`calcHorsZone`, `horsZone` field on trade): discipline system — London 11-14h, NY 16:30-19:30 GMT+4. Persisted on the trade at save time.
- **Session** (`isHorsSession`, `horsSession` filter): journal display only — London 10-13h, NY 16:30-19h GMT+4. Not persisted.

## React src/ architecture (migration)

- `src/App.tsx` — page router (useState-based), holds `trades` + `accounts` state locally (no Supabase yet)
- `src/types/trade.ts` — TypeScript interfaces (`Trade`, `Account`, `Cashflow`)
- `src/config/constants.ts` — shared enums (`SESSIONS`, `RESULTATS`, etc.) and `KILLZONES` / `SESSION_HOURS`
- `src/hooks/useFilteredTrades.ts` — filtering hook
- `src/hooks/usePerformanceAudit.ts` — discipline audit hook
- `src/components/` — `Journal`, `DisciplineBanner`, `DashboardFilters`, `Sidebar`, `TradeForm`

Pages other than dashboard and journal render a "en cours de migration" placeholder.
