# CLAUDE.md — TradeLog

Guidance for Claude Code when working in this repository.

## Two-track codebase

| Track | Path | Status |
|---|---|---|
| **Vanilla (active)** | `index.html` (~4700 lines) | Production — all features live here |
| **React migration** | `src/` + `vite.config.ts` | In progress — dashboard & journal only |

**Always edit `index.html` unless explicitly told to work on the React version.**

---

## Running the app

```bash
# Vanilla — open directly, no build step
start index.html

# React (Vite + TypeScript)
npm run dev        # dev server
npm run build      # tsc + vite build → dist/
npm run preview    # preview build
```

No linter, no test suite.

---

## index.html file layout

| Line range | Content |
|---|---|
| 1–18 | `<head>`: meta, PWA tags, favicon (inline SVG), font imports, Chart.js 4.4, Supabase JS v2 |
| 19–1674 | `<style>` block — all CSS |
| 1675+ | `<body>`: sidebar, main layout, all page divs, all modals |
| ~2129 | `<script>` block — all JS |

CSS editing rules: **add new rules at the very end of `<style>` to win the cascade**. There is a "RADICAL v4" block mid-file that overrides some base rules — be aware of specificity conflicts.

---

## Global state variables

```js
DB = { trades[], accounts[], cashflow[], tags[], instruments[], rules[], checklists[] }

// Dashboard
dashFilters    = Set<accountName|'all'>
dashPeriod     = 'today'|'week'|'month'|'3months'|'year'|'all'|'custom'
dashCustomFrom = ''   // YYYY-MM-DD
dashCustomTo   = ''
dashWeekOffset = 0    // negative = past weeks
dashMonthOffset= 0
dashYearOffset = 0

// Journal
jFilters = { session, instrument, resultat, dateFrom, dateTo, period, rNonProfitable, horsSession }
jAccFilters = Set<accountName|'all'>

// Calendar
calAccFilters = Set<accountName|'all'>
calY, calM, calFilter

// Cashflow
cfAccFilters = Set<accountName|'all'>
cfFilters = { type }

// Trade form
editId, tConf, tDir, tTags[], tScrHTF, tScrMTF, tScrLTF, tStructure

// Album viewer
albumTrades[], albumIdx, albumImgMode = 'htf'|'mtf'|'ltf'

// Charts
charts = {}   // Chart.js instances keyed by canvas id

curPage = 'dashboard'
```

---

## Data flow

1. `loadApp()` → fetches all Supabase tables in parallel → populates `DB`
2. `showPage(p)` → activates page div, calls `render*()` for that page
3. Each page has one top-level renderer:

| Page | Renderer | Key sub-calls |
|---|---|---|
| Dashboard | `renderDash()` | `renderPills()` → `renderDashFilter()` → hero KPIs → `renderDisciplineBanner()` → `renderCharts()` → `renderEnCours()` → `renderDashBottom()` → `renderAICoach()` |
| Journal | `renderJournal()` | `renderJAccPills()` → `renderJFilters()` → `renderJSummary()` → `renderJTable()` |
| Calendar | `renderCal()` | `renderCalAccPills()` |
| Cashflow | `renderCashflow()` | `renderCFAccPills()` |
| Accounts | `renderAccounts()` | |
| Rules | `renderRules()` | `renderRTab()` + `renderCTab()` |
| Settings | `renderSettings()` | |

**`getFT()`** = single source of truth for filtered journal trades — never filter `DB.trades` directly.

---

## Supabase schema

Tables: `trades`, `accounts`, `cashflow`, `tags`

```js
// trades: one row per trade
{ id, data: <TradeObject> }     // data column stores full JSON

// accounts
{ id, name, start_capital, color, updated_at }

// cashflow
{ id, type, date, compte, montant_usd, montant_mur, taux, note, updated_at }

// tags
{ name }
```

Supabase helpers:
- `sbLoadTrades()` / `sbUpsertTrade(t)` / `sbDeleteTrade(id)`
- `sbLoadAccounts()` / `sbUpsertAccount(acc)` / `sbDeleteAccount(id)`
- `sbLoadCashflow()` / `sbUpsertCF(cf)` / `sbDeleteCF(id)`
- `sbLoadTags()` / `sbUpsertTag(name)`

Credentials: hardcoded `SUPABASE_URL` + `SUPABASE_KEY` constants (~line 2131).

---

## Trade object fields

```
id             string (uuid)
compte         string (account name)
date           YYYY-MM-DD
heure          HH:MM
session        'Asian'|'London'|'New York'|'Hors session'
instrument     string (e.g. 'XAUUSD')
direction      'Long'|'Short'
structure      'solide'|'fragile'|null
horsZone       bool  — true = taken outside killzones (persisted at save time)
stars          1–5   — confidence level
montantRisque  number
gainPerte      number
rr             number (computed)
resultat       'Win'|'Loss'|'Breakeven'|'En cours'
etat           'Calme'|'Confiant'|'Stressé'|'Impatient'|'Focalisé'|'Fatigue'
pourquoiEntrer string
douteHesitation string
screenshotAvant  URL
screenshotApres  URL
tags[]         string[]
```

Backward-compat: `structureSolide` (bool) → `structure`; `confiance` (1–10) → `stars` via `Math.round(confiance/2)`.

---

## Key helper functions

| Function | Purpose |
|---|---|
| `getFT()` | Filtered + sorted journal trades (respects `jFilters`, `jAccFilters`) |
| `getDashRange()` | Returns `{from, to}` for dashboard, respects `dashPeriod` + offsets |
| `getDashNavLabel()` | Human label for current nav period ("Sem. 23 · 2–8 juin 2025") |
| `getISOWeek(d)` | ISO week number from Date |
| `stats(f)` | `{total, wins, losses, be, pnl, winRate, avgRR}` from trade array |
| `calcRR(t)` | R:R = gainPerte / montantRisque |
| `calcSession(heure)` | Session label from HH:MM |
| `calcHorsZone(heure)` | True if outside killzones (London 11–14h, NY 16:30–19:30 GMT+4) |
| `isHorsSession(heure)` | True if outside sessions (London 10–13h, NY 16:30–19h GMT+4) — journal filter only, not persisted |
| `isRNonProfitable(t)` | True if stars ≤ 3 |
| `getDisciplineAudit(f)` | `{score, leak, total, undisciplined[], cntHz, cntConf, cntFrag}` |
| `getAuditReasons(t)` | Array of discipline failure strings for tooltip |
| `getChartTheme()` | Returns palette object keyed by theme (see Charts section) |
| `dc(id)` | Destroy Chart.js instance before re-render |
| `esc(s)` | HTML-escape a string |
| `fmtD(d)` | Format date string to "dd/mm/yyyy" |
| `fmtN(n,dec)` | Format number with `dec` decimal places |
| `openDetail(id)` | Open detail modal for a trade |
| `openAlbumView(id)` | Open album view (screenshot viewer + detail panel) for a trade |
| `setTheme(t)` | Set theme: `'light'` (default) / `'dark'` / `'gold'` |
| `toggleTheme()` | Cycle through themes |

---

## Theme system — 3 themes

Theme is stored as `document.body.dataset.theme` (`''`=light, `'dark'`, `'gold'`).
Persisted in `localStorage.tl_theme`.

| Theme | `data-theme` | Character |
|---|---|---|
| **Clair** (default) | `''` (`:root`) | Institutional, clean blue |
| **Sombre** | `"dark"` | True dark, neon accents |
| **Chaud** | `"gold"` | Warm parchment, antique gold |

### CSS design tokens (always use `var(--token)`, never hardcode colors)

| Token | Purpose |
|---|---|
| `--bg`, `--bg2` | Page background |
| `--surface`, `--surface2`, `--surface3` | Card/panel backgrounds (elevation) |
| `--border`, `--border2` | Borders (main / subtle) |
| `--text`, `--text2`, `--text3`, `--text4` | Text hierarchy |
| `--accent`, `--accent2`, `--accent-bg`, `--accent-bd` | Primary action color |
| `--green`, `--green-bg`, `--green-bd` | Win / positive |
| `--red`, `--red-bg`, `--red-bd` | Loss / negative |
| `--amber`, `--amber-bg`, `--amber-bd` | Warning / BE |
| `--gold`, `--gold-bg`, `--gold-bd` | Gold highlights |
| `--blue`, `--blue-bg`, `--blue-bd` | Info |
| `--sb-bg` | Sidebar background |
| `--sb-active-bar` | Sidebar active indicator |
| `--header-bg` | Sticky page header background |
| `--r`, `--rl`, `--rxl` | Border radii (5/8/12px) |
| `--sh`, `--shl`, `--shfocus` | Box shadows |
| `--sidebar` | Sidebar width (228px) |

### Chart colors — always use `getChartTheme()`

```js
const ct = getChartTheme();
// ct.win / ct.loss / ct.winBg / ct.lossBg
// ct.winFill / ct.lossFill (fill areas)
// ct.midBg (breakeven)
// ct.emptyBg (zero/empty bars)
// ct.grid (gridline color)
// ct.ttBorder (tooltip border)
```

Call `_applyChartTheme()` (internal) is called automatically on theme switch to re-render all charts.

---

## Dashboard — detailed breakdown

### Layout (top → bottom)

1. **`.dash-hero`** — Command bar
   - **`.dash-hero-acc-row`** → `#dashPills` — account filter pills (All + one per account)
   - **`.dash-hero-filter-row`** → `#dashFilterBar` — period filter (separate row)
   - **`.dash-hero-body`** — main P&L + 4 hero KPIs: Win Rate, RR Moyen, Profit Factor, Discipline %

2. **`#dashDiscipline`** — `renderDisciplineBanner()` — amber 3-KPI banner (Hors Zone %, Fragile %, Confiance faible %)

3. **`#dashStats`** — 4 secondary stat cards: Win Rate (with progress bar), RR Moyen, P&L Total, Total Trades

4. **`.charts-grid`** (2 cols) — Courbe de Capital · Gain Net par Session

5. **Full-width** — P&L par Trade (one bar per individual trade, sorted by date)

6. **`.charts-row`** (4 cols) — Gain Net par Instrument · Gain Net par Jour · Distribution W/L/BE · Win Rate par Confiance ★

7. **`#dashMetricsRow`** (5 cols) — Profit Factor · Gain moyen · Perte moyenne · Espérance · Consistance

8. **`.dash-bottom`** (3 cols) — Streaks (last 20 dots) · Best/Worst trades · Top instruments

9. **`#dashEnCours`** — En cours trades

10. **`#dashAICoach`** — AI Coach (Gemini)

### Period filter

- Pills: Auj. / Semaine / Mois / 3 mois / Année / Tout / ···(custom)
- For Week/Month/Year: nav row with ← label → arrows
- Next (→) button disabled when offset = 0 (current period)
- `setDashPeriod(v)` resets offset to 0
- `navigateDash(dir)` increments/decrements the relevant offset

### Capital chart (FTMO-style)

- Green above `startCap`, red below — via `segment.borderColor` + `fill.target.value`
- Dashed reference line plugin (`capRefPlugin`) drawn at `startCap`
- 2nd dataset: "Courbe Rigueur" (theoretical capital without undisciplined trades)

---

## Charts — all instances

| Canvas ID | Chart type | Content |
|---|---|---|
| `cCapital` | Line | Capital curve (real + rigueur), FTMO coloring |
| `cSession` | Bar | Net P&L by session — clickable → trade list modal |
| `cTrades` | Bar | P&L per individual trade (one bar each), sorted by date, clickable → openDetail |
| `cInstr` | Bar | Net P&L by instrument — clickable |
| `cDay` | Bar | Net P&L by day of week — clickable |
| `cDist` | Doughnut | W/L/BE distribution — clickable |
| `cStars` | Bar | Win rate per confidence star level (1–5) |

Always call `dc(id)` before rendering into an existing canvas.

---

## Journal page

- Account pills → `jAccFilters`
- Filter bar: Session / Instrument / Résultat / Date from–to / Period / R Non-Profitable / Hors Session
- Summary row: P&L, Win Rate, Trades count, RR Moyen
- Table (desktop) / Cards (mobile ≤600px)
- Each row: badge (Win/Loss/BE/En cours), instrument, date, heure, session, direction, RR, P&L, stars, INDISCIPLINE amber badge if undisciplined
- Click row → `openAlbumView(id)` (album modal with screenshot + details)

---

## Album view modal

Full-screen modal for reviewing a trade with screenshots.

- Left panel: screenshot (HTF/MTF/LTF tabs), zoom on click
- Right panel: KPIs (P&L, RR, stars), all trade fields, tags, notes
- Footer: ← Précédent / Suivant → navigation between trades, Modifier button
- Keyboard: ← → arrow keys

---

## Trade form (add/edit modal)

Fields: Compte · Date · Heure · Session (auto from heure) · Instrument (dropdown + "Autre") · Direction (Long/Short toggle) · Résultat · Stars (1–5, visual star selector) · Structure (solide/fragile/null) · État · Montant Risqué · Gain/Perte · RR (auto) · Pourquoi Entrer · Doute/Hésitation · Tags (chips) · Screenshots (HTF/MTF/LTF URLs)

`calcHorsZone(heure)` is called at save time to set `horsZone` on the trade.

---

## Discipline system

**Killzone** (persisted on trade at save time):
- `calcHorsZone(heure)` → true if outside London 11–14h AND NY 16:30–19:30 (GMT+4)
- `horsZone: true` = out of killzone = undisciplined

**Undisciplined trade** = any of:
- `horsZone === true`
- `structure === 'fragile'`
- `stars < 3`

**`getDisciplineAudit(f)`** returns:
- `score` = % of disciplined trades (0–100)
- `undisciplined[]` = array of undisciplined trades
- `cntHz`, `cntConf`, `cntFrag` = individual leak counts

**Session filter** (journal display only, NOT persisted):
- `isHorsSession(heure)` → true if outside London 10–13h AND NY 16:30–19h (GMT+4)

---

## AI Coach

- `fetchAIInterpretation(trades)` — Gemini 2.5-flash, sends last 20 trades
- 6h cache in `localStorage.tl_ai_cache`
- API key stored in `localStorage.gemini_api_key` (set in Settings page)
- `renderAICoach(f)` — purple-glowing block in `#dashAICoach`, hidden if no API key
- `refreshAICoach()` — clears cache, re-fetches
- Endpoint: Gemini 2.5-flash `generateContent`

---

## Settings page

Options available:
- Theme selector (3 themes with visual cards)
- Sidebar style toggle (dark / light)
- Gemini API key input
- Instruments list (add/remove)
- Export CSV
- Clear local cache

---

## Other pages

### Calendrier
- Monthly grid, one cell per day
- P&L per day shown in cell (green/red background)
- Click day → `openDayDetail(ds)` — list of trades for that day
- Account filter pills

### Dépôts & Retraits (Cashflow)
- Table of deposits/withdrawals per account
- Columns: Date, Type, Compte, Montant USD, Montant MUR, Taux MUR/USD, Note
- Summary cards (total in/out per currency)
- Account filter pills

### Comptes
- Cards per account with color swatch
- Edit start capital, rename account, delete account
- Account dot colors from `ACC_COLORS` palette

### Règles & Checklist
- Two tabs: "Règles de trading" / "Checklist pré-trade"
- Rules: CRUD list persisted to DB
- Checklist: checkboxes checked state in `checkedItems{}`

---

## Layout & responsive

Sidebar: `position:fixed`, width `var(--sidebar)` = 228px. `.main` has `margin-left:var(--sidebar)`.

On mobile (≤768px): sidebar hidden by default (`transform:translateX(-100%)`), overlay shown on open.
**No hamburger button** — sidebar navigation was removed. Sidebar only accessible on desktop.

### Breakpoints

| Max-width | Changes |
|---|---|
| 1100px | 2-col grids |
| 900px | 1-col charts, sidebar 200px |
| 768px | Sidebar hides, `.main` margin-left:0 |
| 600px | Journal as cards instead of table, 1-col stats |
| 480px | `.disc-banner` → 2 cols, tighter padding |

**Mobile overflow fix** (at end of `<style>`):
- `html`, `body`, `.main`, `.page-content` have `overflow-x:hidden`
- `.table-wrap`, `.ch` have `max-width:calc(100vw - 24px)`

---

## Loading screen

HTML: `#loadingScreen` with animated ECG SVG, title reveal, progress bar, cycling status text.

JS helpers:
- `startLoadingCycle()` — cycles status messages every 1400ms with fade transition
- `hideLoadingScreen()` — clears interval, adds `.hidden` class (CSS fade-out), removes element after 700ms

---

## Favicon

Inline SVG data URI in `<head>` — ECG waveform on dark blue background (`#1C3461`).

---

## Constants (in script)

```js
SESSIONS    = ['Asian','London','New York','Hors session']
ETATS       = ['Calme','Confiant','Stressé','Impatient','Focalisé','Fatigue']
STRUCTURES  = ['BOS haussier','BOS baissier','ChoCH haussier','ChoCH baissier','Range','Tendance','Autre']
RESULTATS   = ['Win','Loss','Breakeven','En cours']
FORM_INSTRUMENTS = ['EURUSD','GBPUSD','XAUUSD','GBPJPY','EURJPY','USDJPY','NZDUSD','NASDAQ']
WARN_INSTRUMENTS = ['USDJPY','EURJPY']  // warning badge in form
ACC_COLORS  = ['#2558CE','#8E6B1E','#2B8A4E',...]  // 8 colors for accounts
KEY         = 'tradelog_v3'  // localStorage key
```

---

## React src/ (migration, incomplete)

- `src/App.tsx` — page router (useState), local `trades` + `accounts` state (no Supabase yet)
- `src/types/trade.ts` — TypeScript interfaces
- `src/config/constants.ts` — shared enums + killzone/session hours
- `src/hooks/useFilteredTrades.ts`, `usePerformanceAudit.ts`
- `src/components/` — `Journal`, `DisciplineBanner`, `DashboardFilters`, `Sidebar`, `TradeForm`

Only dashboard & journal partially migrated. All other pages show "en cours de migration".
