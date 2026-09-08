# TradeLog — Application Specification
> Complete source of truth for rebuilding this app in any technology.
> Every section is self-contained and precise. Read sequentially for full context.

---

## 1. OVERVIEW

**Purpose:** Personal trading journal for Forex/CFD/Gold traders using Price Action / Smart Money Concepts. Records trades, computes performance metrics, detects behavioral patterns, and coaches the trader.

**Target user:** Solo retail trader, single device, French-speaking.

**Current stack:** Vanilla JS SPA + Supabase backend. Three files: `index.html` / `app.js` / `style.css`.

**Key constraints:**
- Auth required (Supabase email/password)
- Data lives in Supabase (cloud) + mirrored to `localStorage` (offline cache, key `tradelog_v3`)
- Language: French UI, English code
- Responsive: desktop-first, fully usable on mobile (≤768px)

---

## 2. TECH STACK & DEPENDENCIES

| Dependency | Version | Usage |
|---|---|---|
| Supabase JS | v2 (CDN) | Auth + DB (4 tables) |
| Chart.js | 4.4 (CDN) | 7 chart types in dashboard |
| Google Gemini | 2.5-flash | AI Coach analysis |
| Fonts | DM Mono (mono), Inter (sans) | Via Google Fonts |

**Supabase project:** `nakykfuduehcwsjuicpb.supabase.co`

---

## 3. DATA MODELS

### 3.1 Trade Object (full schema)

```ts
interface Trade {
  id: string                    // timestamp string, e.g. "1748271234567"
  compte: string                // account name (FK → accounts.name)
  date: string                  // "YYYY-MM-DD"
  heure: string                 // "HH:MM" (24h, GMT+4)
  session: string               // auto-computed: "Asian"|"London"|"New York"|"Hors session"
  instrument: string            // "XAUUSD", "EURUSD", etc.
  direction: "Long"|"Short"|""
  strategie: "1-trend"|"2-pullback"|"2a-transition"|"3-realignement"|""
  horsZone: boolean             // auto-computed from heure (outside killzones)
  stars: 1|2|3|4|5             // confidence level (1=min, 5=max)
  montantRisque: string         // "$" amount at risk (number as string)
  gainPerte: string             // P&L in $ (positive=win, negative=loss)
  rr: string                   // computed RR as string: gainPerte / |montantRisque|
  expectedRR: string            // user-entered expected RR (e.g. "2.5")
  resultat: "Win"|"Loss"|"Breakeven"|"En cours"
  pourquoiEntrer: string        // free text: reason for entry
  douteHesitation: string       // free text: doubts/hesitation
  screenshotHTF: string         // URL (TradingView or other)
  screenshotMTF: string         // URL
  screenshotLTF: string         // URL
  tags: string[]               // array of tag strings

  // Legacy compat fields (old trades only, auto-converted on read):
  confiance?: number            // 1-10 → converted to stars: Math.round(confiance/2)
  screenshotAvant?: string      // → screenshotHTF
  screenshotApres?: string      // → screenshotMTF
  screenshot?: string           // → screenshotHTF
  structure?: "solide"|"fragile" // removed field, kept for old data audit
  etat?: string                 // removed field
}
```

### 3.2 Account Object

```ts
interface Account {
  id: string          // string timestamp
  name: string        // display name, also FK in trades.compte
  startCapital: number // initial capital in USD
  color: string       // hex color for UI dot
}
```

### 3.3 Cashflow Object

```ts
interface Cashflow {
  id: string
  type: "depot"|"payout"
  date: string        // "YYYY-MM-DD"
  compte: string      // account name
  montantUSD: number
  montantMUR: number  // Mauritian Rupee equivalent (optional)
  taux: number        // exchange rate USD→MUR
  note: string
}
```

### 3.4 DB Global Object

```ts
const DB = {
  trades: Trade[],
  accounts: Account[],
  cashflow: Cashflow[],
  tags: string[],           // user-defined tag pool
  instruments: string[],    // user-defined instrument list
  rules: { id: number, text: string }[],
  checklists: { id: number, text: string }[]
}
```

### 3.5 Default Data

**Default accounts:**
- `{ id:'1', name:'Compte Principal', startCapital:10000, color:'#B8963E' }`
- `{ id:'2', name:'Prop Firm', startCapital:50000, color:'#2D7A4F' }`

**Default rules (5):** No trading without structure confluence, wait for liquidity, min RR 1:2, max 2 trades/session, no revenge trading.

**Default checklist (6):** Structure identified on HTF, liquidity visible, POI marked, ≥3 confluences, news checked, SL/TP defined.

**Default instruments:** EURUSD, GBPUSD, USDJPY, AUDUSD, USDCAD, EURCAD, GBPJPY, EURJPY, XAUUSD

**Quick-select instruments in form:** GER40, EURUSD, XAUUSD, GBPUSD

**Warn instruments (show edge warning):** USDJPY, EURJPY

---

## 4. SUPABASE SCHEMA

### 4.1 Table: `trades`
```sql
id          text PRIMARY KEY   -- trade.id
data        jsonb              -- full Trade object as JSON
updated_at  timestamptz
```
**Read:** `SELECT data FROM trades` → unwrap `.data` from each row.
**Write:** `UPSERT { id, data: tradeObject, updated_at }`

### 4.2 Table: `accounts`
```sql
id            text PRIMARY KEY
name          text
start_capital numeric
color         text
updated_at    timestamptz
```
**Mapping on read:** `{ id: String(row.id), name, startCapital: row.start_capital, color }`

### 4.3 Table: `cashflow`
```sql
id           text PRIMARY KEY
type         text              -- "depot"|"payout"
date         text              -- "YYYY-MM-DD"
compte       text
montant_usd  numeric
montant_mur  numeric
taux         numeric
note         text
updated_at   timestamptz
```
**Mapping on read:** `{ id, type, date, compte, montantUSD: row.montant_usd, montantMUR: row.montant_mur, taux, note }`

### 4.4 Table: `tags`
```sql
name  text PRIMARY KEY
```

---

## 5. BUSINESS LOGIC

### 5.1 Session Calculation
`calcSession(heure: "HH:MM") → string`
```
00:00–06:59 → "Asian"
07:00–12:59 → "London"
13:00–17:59 → "New York"
18:00–23:59 → "Hors session"
```

### 5.2 Killzone (Hors Zone) — auto-persisted on trade
`calcHorsZone(heure: "HH:MM") → boolean`
```
Killzones (GMT+4):
  Londres: 11:00–13:59
  New York: 16:30–19:29
horsZone = true if NOT in any killzone
```

### 5.3 Journal Session Filter (display only, not persisted)
`isHorsSession(heure) → boolean`
```
London session (for journal filter): 10:00–12:59
NY session (for journal filter):     16:30–18:59
horsSession = true if NOT in either
```
> Note: Different thresholds from killzone above.

### 5.4 RR Calculation
```
calcRR(trade) → number | null
rr = gainPerte / |montantRisque|
Returns null if either field is NaN or montantRisque === 0
```

### 5.5 Stats Object
`stats(trades[]) → { total, wins, losses, be, winRate, avgRR, pnl }`
- `total` = closed trades only (excludes "En cours")
- `winRate` = `round(wins / total * 100)`
- `avgRR` = average of non-null RR values across closed trades
- `pnl` = sum of `gainPerte` (closed only)

### 5.6 Discipline Audit
`getDisciplineAudit(trades[]) → { score, leak, total, undisciplined[], cntHz, cntConf, cntNoReason, cntNoStrategie, pctStrategie, pctReason }`

A trade is **undisciplined** if ANY of:
- `horsZone === true`
- `stars < 3` (or legacy `confiance < 6`)

```
score = round((1 - undisciplined.length / total) * 100)
leak = sum of negative gainPerte from undisciplined trades (absolute value)
pctStrategie = round((total - cntNoStrategie) / total * 100)
pctReason = round((total - cntNoReason) / total * 100)
```

### 5.7 Audit Reasons (per trade tooltip)
`getAuditReasons(trade) → string[]`
- `horsZone === true` → "Hors Session (saisie à HH:MM)"
- `structure === 'fragile'` → "Structure Fragile (contre-tendance)"
- `stars < 3` → "Confiance Faible (N★ < 3★)"
- `!pourquoiEntrer` → "Aucune raison documentée (impulsif)"

### 5.8 Max Drawdown
`maxDrawdown(trades, startCapital) → { abs: number, pct: number }`
- Sort closed trades by date+heure ascending
- Walk equity curve from startCapital, track peak
- `abs = peak - trough`, `pct = abs / peak * 100`

### 5.9 Expectancy
`expectancy(trades) → number`
```
E = (winRate × avgWin) - (lossRate × avgLoss)
```

### 5.10 Profit Factor
```
PF = totalWinGross / |totalLossGross|
```

### 5.11 Kelly Criterion
```
payoff = avgWin / avgLoss
kelly = winRate - (1 - winRate) / payoff
suggestedRisk = min(kelly * 100, 5)   // capped at 5%
```

### 5.12 Trader Score (5 axes, 0–100 each)
```
Discipline  = getDisciplineAudit(trades).score
Risk Mgmt   = min(100, round(payoff * 40) + 10)
Consistency = min(100, round(winRate * 1.3))
Execution   = round(documented/total * 50 + solide/total * 50)
Edge        = exp > 0 ? min(100, round(30 + exp*2)) : max(0, round(30 + exp))
Overall     = round((D + R + C + Ex + Ed) / 5)
```
- `documented` = trades with `pourquoiEntrer.length > 5`
- `solide` = trades with `structure === 'solide'` (legacy field)

### 5.13 Pattern Detection
`detectPatterns(trades) → Pattern[]` — checked against `TradingLimits`:

| Pattern | Trigger | Severity |
|---|---|---|
| Overtrading | todayTrades ≥ limits.maxTradesDay | high |
| Kill Switch | todayPnl ≤ -limits.maxDailyLoss | critical |
| Revenge Trading | Last 2 closed: prev=Loss, last≠Win, same day, <1h apart | high |
| Tilt | ≥3 consecutive losses in last 10 | high |
| Size Escalation | lastRisk > avgRisk(prev 5) × 2 | medium |

**Trading Limits** (localStorage `tl_limits`, defaults):
```json
{ "maxTradesDay": 3, "maxDailyLoss": 150, "minStars": 3, "requireReason": true }
```

### 5.14 Edge Matrix
`buildEdgeMatrix(trades)` — cross-table: Instrument × Session → `{ wins, total, wr, pnl }`
- Only cells with ≥2 trades show a win rate
- Color: green if wr ≥ 60%, red if wr < 40%

### 5.15 Capital Calculation (single account)
```
currentCapital = account.startCapital
              + sum(gainPerte for all account trades)
              + sum(depot cashflows) - sum(payout cashflows)
```

---

## 6. PAGES & FEATURES

### 6.1 Dashboard
**Route:** `dashboard` (default)
**State:** `dashPeriod`, `dashWeekOffset`, `dashMonthOffset`, `dashYearOffset`, `dashCustomFrom/To`, `dashFilters` (Set of account names, or 'all')

**Layout top→bottom:**
1. **Toolbar** (`.dash-toolbar`): Account pills + Period filter
2. **Today Strip** (`.dash-today`): Count, PnL, WR, streak — today's closed trades, always from ALL data regardless of filter period. Shows only if ≥1 trade today.
3. **KPI Band** (`.dash-kpi-band`): 7 cells in a grid
4. **Capital chart** (full width)
5. **Charts row** (2 columns): P&L per trade + Distribution donut
6. **Trades en cours** (table or card list)
7. **Insights tabs** (Patterns | Edge Map | Score)

**Period navigation:**
- `today`, `week`, `month`, `3months`, `year`, `all`, `custom`
- `week/month/year` show `← label →` nav to go to past periods (offset ≤ 0)

**KPI Band cells:**
1. Capital (only when single account selected): `startCapital + allTimePnL + cashflowNet`
2. P&L Net (clickable → opens trade list modal)
3. Win Rate (clickable → opens wins list)
4. RR Moyen + Expectancy sub
5. Profit Factor
6. Max Drawdown
7. Process: two progress bars (Stratégie% and Raison%)

**Insights tabs:**
- **Patterns**: `detectPatterns(f)` — alerts sorted by severity
- **Edge Map**: `buildEdgeMatrix(f)` — instrument × session heatmap table
- **Score**: `renderTraderScore(f)` — 5-axis score bars + optimal stop rules

### 6.2 Journal
**Route:** `journal`
**State:** `jFilters`, `jAccFilters`, `jViewMode` ('table'|'cards'), `_detailNavIds`

**Filters bar:**
- Period select (today/week/month/lastmonth/3months/year/all/custom)
- Session select
- Instrument select
- Résultat select
- Confiance select (all / R non profitable ≤3★ / profitable >3★)
- Hors session select (all / hors / en)
- Date range (shown only in 'custom' mode)
- Reset button
- Toggle view (list/cards)
- Export CSV button

**Summary bar:** 5 stats (Trades count, P&L, Win Rate, RR Moyen, Profit Factor) — from `getFT()`.

**Table view** (`.jl-row`): Thumbnail | Instrument+badges | Date/Heure | Compte | Session | RR | Gain/Perte | Actions (duplicate, edit, delete)

**Badges on rows:**
- Result badge (Win/Loss/BE/En cours)
- `⚠ INDISCIPLINE` (amber) — if `horsZone || stars<3`
- `R NON PROFITABLE` (blue) — if `stars ≤ 3`
- `HORS SESSION` (red) — if `isHorsSession(heure)`

**Cards view**: Image thumbnail + instrument, direction arrow, PnL, date/time/session, RR, badges, action buttons.

**Clicking a row/card** → `openDetail(id)` → opens right drawer.

**getFT() filter logic:**
1. Only active accounts
2. `jAccFilters` account filter
3. session, instrument, resultat exact match
4. dateFrom ≤ date ≤ dateTo
5. rNonProfitable filter
6. horsSession filter
7. Sort: date DESC, heure DESC

### 6.3 Trade Form (Right Drawer)
**Modes:** New (`openNew()`) | Edit (`openEdit(id)`) | Duplicate (`dupTrade(id)`)
**Container:** `.trade-drawer` inside `.trade-drawer-overlay#tradeModal`
**Width:** `clamp(560px, 50vw, 900px)` desktop; 100% at ≤600px

**Form sections:**

**Section 1 — Informations générales** (3-col grid):
- Compte (select — from DB.accounts)
- Date (date input, default today)
- Heure (time input, default now)

**Section 2 — Analyse & Setup** (2-col grid):
- Instrument (select from FORM_INSTRUMENTS + "Autre" → custom text input; shows `⚠️ Edge non prouvé` for WARN_INSTRUMENTS)
- Stratégie (select):
  - `1-trend` → "1 · TREND — Pro-HTF · Pro-MTF"
  - `2-pullback` → "2 · PULLBACK — Counter-HTF · Pro-MTF"
  - `2a-transition` → "2A · TRANSITION — Pro-HTF · Counter-MTF"
  - `3-realignement` → "3 · RÉALIGNEMENT — Swing ↔ Internal"

**Section 3 — Analyse & Setup** (continued, 2-col grid):
- Direction: toggle buttons `↑ Long` / `↓ Short` (can be deselected)
- Confiance: 5-star rating (1–5), default 3

**Section 3b — Text** (2-col grid):
- Pourquoi entrer? (textarea, 110px height)
- Doute ou hésitation (textarea, 110px height)

**Section 4 — Gestion & Résultat** (3-col grid):
- Montant risqué ($) — number input
- Gain / Perte ($) — number input, step 0.01
- Résultat — select (Win/Loss/Breakeven/En cours)

**Section 4b — RR** (2-col grid):
- RR attendu — number input (user-entered expected RR)
- RR calculé — read-only display, auto-updates on input change

**Section 5 — Captures d'écran** (3-col grid):
- HTF — Vue macro
- MTF — Vue intermédiaire
- LTF — Entrée précise
- Each: URL input → shows preview thumbnail; if image already set → shows image with zoom/remove buttons
- Click image → `openImgExpand(url, label)`

**Save logic (`saveTrade()`):**
1. Read all field values
2. Compute `session` from heure, `horsZone` from heure, `rr` from gainPerte/montantRisque
3. If `instrument = "Autre"` → use custom text field value (uppercase)
4. Warn (non-blocking) if instrument missing
5. Upsert to `DB.trades`, save to localStorage, close drawer
6. `sbUpsertTrade(t)` to Supabase async
7. Re-render current page

### 6.4 Trade Detail View (Right Drawer)
**Same drawer as form**, triggered by `openDetail(id)`.
**Header:** instrument + date (dim text) + result badge, prev/next nav buttons (`‹ N/M ›`), close.

**Content:**
- Stats grid (3 col, `.detail-grid`): Compte, Session, Heure, Direction, Stratégie, Confiance (stars), Montant risqué, Gain/Perte (colored), RR attendu, RR réalisé (colored)
- Text blocks (flex-wrap, each `min-width:180px`): Pourquoi entrer + Doute/Hésitation
- Tags (flex-wrap pills)
- Screenshots (`.detail-scr-grid`, responsive columns): HTF / MTF / LTF
  - Click thumbnail → `openImgExpand(url, label)` — expands in left panel (desktop) or fullscreen modal (mobile ≤600px)
- Actions: Fermer | Modifier (calls `openEdit(id)`)

**Navigation (prev/next):**
- `_detailNavIds[]` set by `renderJTable()`/`renderJCards()` = `getFT().map(t => t.id)`
- `openDetail(id)` finds idx in `_detailNavIds`, updates `_detailNavIdx`
- Arrow keys `←/→` work when drawer is open (not in form mode)
- Prev/Next disabled at boundaries

**Image expand panel (`#imgExpandPanel`):**
- Desktop only (hidden at ≤600px)
- Positioned: `fixed; top:0; left:0; right:clamp(560px,50vw,900px); bottom:0`
- Dark overlay reuses drawer backdrop area
- z-index: 1001 (above drawer at 1000)
- **Zoom:** mouse wheel → `scale()` transform (0.5× to 5×), double-click → reset
- **Mobile pinch zoom:** touchstart/touchmove scale detection
- Click panel background → `closeImgExpand()`
- ESC → closes image panel first, then drawer

### 6.5 Calendar
**Route:** `calendar`
**State:** `calY`, `calM`, `calAccFilters`

**Layout:**
- Toolbar: ‹ Month Year › + Today button + account pills
- Month header stats: Trades count, Win Rate, P&L, RR Moyen
- 7-col grid (Mon–Sun): each day cell shows PnL, trade count, WR%, color bar
- Click day cell → `openDayDetail(ds)` → opens `#detailModal` with day's trades list
- Weekly summary row below calendar

**Day cell coloring:**
- `day-win` (green tint) if day PnL > 0
- `day-loss` (red tint) if day PnL < 0
- `today` class for current day

### 6.6 Rapport & Analyse
**Route:** `report`
**State:** Shares `dashPeriod`, `dashFilters` with dashboard

**Sections:**
1. **Metrics row** (`#reportMetricsRow`): 3 cards — Trades/WR/Streak | P&L/PF/Expectancy | RR/Drawdown
2. **Top instruments** (`#reportTopInstrCard`): Horizontal bar chart — P&L by instrument (top 8), colored green/red by value. Click bar → trade list.
3. **P&L par heure** (`#rHour`): Bar chart by hour of day (00–23), colored by gain/loss
4. **Performance par jour** (`#rDay`): Table — Mon–Sun with P&L, W/L%, gross wins/losses, trade count. Click row → trade list.
5. **Streaks heatmap** (`#rStreaksSec`): Last 20 trades as colored mini-squares (green=Win, red=Loss, amber=BE). Click → openDetail.

### 6.7 Cashflow (Dépôts & Retraits)
**Route:** `cashflow`
**State:** `cfAccFilters`, `cfFilters.type`

**Features:**
- Account filter pills
- Type filter (all / depots / payouts)
- Summary cards: Total dépôts | Total payouts | Net USD | Net MUR
- Table: Date | Type | Compte | USD | MUR | Taux | Note | Actions
- Add/Edit modal: type, date, compte, montantUSD, montantMUR, taux, note

### 6.8 Comptes (Accounts)
**Route:** `accounts`
**Features:**
- Account cards (color-coded): name, start capital, current capital, PnL, cashflow net, trade count
- Enable/disable toggle per account
- Actions: Edit capital, Rename, Delete
- Add new account: name (text), start capital, color picker (8 presets)
- Account color options: `['#2558CE','#8E6B1E','#2B8A4E','#8A5E12','#1E6A9A','#6B4F8A','#B05020','#4A6880']`

**Rename cascade:** Updates `compte` field on all related trades and cashflow entries.

### 6.9 Stratégie (Rules page)
**Route:** `rules` (sidebar label: "Stratégie")
**Content:** Static Pullback Model timeline (4 phases):
1. TREND — Pro-HTF, Pro-MTF
2. PULLBACK — Counter-HTF, Pro-MTF (search for sells, manage TP expectation)
3. 2A TRANSITION — Pro-HTF, Counter-MTF (ChoCH MTF required before entry)
4. RÉALIGNEMENT — Swing ↔ Internal (alignment required)

**Button:** "Copier pour TradingView" → copies formatted text to clipboard.

### 6.10 Paramètres (Settings)
**Route:** `settings`

**Sections:**
1. **AI Coach:** Gemini API key input (password→text on focus), status badge, cache TTL info
2. **Supabase status:** Green dot, URL display
3. **Apparence:** Theme cards (Light / Dark), visual previews
4. **Export:** CSV button + JSON button
5. **Limites de Trading:** Max trades/day, max daily loss ($), min confidence (stars)
6. **Instruments:** Tag list with remove, add input

---

## 7. DESIGN SYSTEM

### 7.1 Themes

Two themes: `light` (default, `data-theme=""`) and `dark` (`data-theme="dark"`).
Stored in `localStorage.tl_theme`. Applied via `setTheme('light'|'dark')`.

```css
/* LIGHT THEME :root */
--bg: #F4F6F9
--bg2: #E8ECF2
--surface: #FFFFFF
--surface2: #F8F9FC
--surface3: #F0F2F6
--border: rgba(15,26,42,.09)
--border2: rgba(15,26,42,.05)
--text: #161D2E
--text2: #374151
--text3: #6B7280
--text4: #9CA3AF
--accent: #1D4ED8
--accent2: #2563EB
--accent-bg: rgba(29,78,216,.06)
--accent-bd: rgba(29,78,216,.2)
--green: #0D9488
--green-bg: rgba(13,148,136,.07)
--green-bd: rgba(13,148,136,.2)
--red: #B45309
--red-bg: rgba(180,83,9,.07)
--red-bd: rgba(180,83,9,.18)
--amber: #D97706
--amber-bg: rgba(217,119,6,.07)
--amber-bd: rgba(217,119,6,.2)
--blue: #2563EB
--blue-bg: rgba(37,99,235,.07)
--blue-bd: rgba(37,99,235,.2)
--r: 5px   --rl: 8px   --rxl: 12px
--sb-bg: linear-gradient(160deg, #161F30 0%, #1E2D44 100%)
--sb-text: #CBD5E1
--sb-active-bar: #60A5FA
--header-bg: rgba(244,246,249,.94)
--mono: 'DM Mono', monospace
```

```css
/* DARK THEME body[data-theme="dark"] */
--bg: #09090B
--bg2: #111115
--surface: #1C1C21
--surface2: #18181D
--surface3: #111115
--border: rgba(255,255,255,.07)
--border2: rgba(255,255,255,.04)
--text: #F4F4F5
--text2: #A1A1AA
--text3: #71717A
--text4: #52525B
--accent: #3B82F6
--green: #2DD4A8
--red: #F87171
--amber: #FBBF24
--sb-bg: linear-gradient(160deg, #080A0F 0%, #0D1117 100%)
--header-bg: rgba(9,9,11,.94)
```

### 7.2 Chart Colors
`getChartTheme()` returns theme-specific palette:

| Token | Light | Dark |
|---|---|---|
| `win` | `#0D9488` | `#2DD4A8` |
| `loss` | `#B45309` | `#F59E0B` |
| `winBg` | `rgba(13,148,136,.75)` | `rgba(45,212,168,.70)` |
| `lossBg` | `rgba(180,83,9,.70)` | `rgba(245,158,11,.65)` |
| `winFill` | `rgba(13,148,136,.08)` | `rgba(45,212,168,.10)` |
| `lossFill` | `rgba(180,83,9,.08)` | `rgba(245,158,11,.10)` |
| `grid` | `rgba(28,43,58,.06)` | `rgba(45,48,57,.9)` |
| `ttBorder` | `rgba(26,93,198,.15)` | `rgba(74,144,226,.30)` |

### 7.3 Responsive Breakpoints

| Breakpoint | Changes |
|---|---|
| ≤1100px | Charts 2-col, metrics 3-col |
| ≤900px | Charts 1-col, sidebar 200px, KPI 2-col |
| ≤768px | Sidebar hidden (slide-in), hamburger, margin-left:0 |
| ≤600px | Journal cards, drawer 100% wide, date font reduced |
| ≤480px | KPI 2-col, minimal padding, single-col grids |
| ≤420px | Journal cards forced 1-col |

**Sidebar:** Fixed left, 220px wide by default. `--sidebar` CSS var.
On mobile (≤768px): `position:fixed; transform:translateX(-100%)`, toggled by hamburger. Overlay `#sidebarOverlay` covers content.

**Mobile bottom nav (`#mobileNav`):** Fixed bottom bar, visible ≤768px.
- 4 main tabs: Dashboard, Journal, Calendar, + (new trade)
- "More" menu for: Cashflow, Comptes, Stratégie, Paramètres

---

## 8. NAVIGATION & STATE MANAGEMENT

### 8.1 Page Routing
`showPage(p)` — string page key:
```
dashboard | report | journal | calendar | cashflow | accounts | rules | settings
```
- Adds `.active` class to `#page-{p}`
- Updates sidebar active state
- Updates `#pageTitle` text
- Updates `#headerActions` (page-specific action button)
- Calls the render function for the page

### 8.2 Global State Variables

```js
// DB
DB = { trades[], accounts[], cashflow[], tags[], instruments[], rules[], checklists[] }

// Dashboard
dashPeriod = 'all'|'today'|'week'|'month'|'3months'|'year'|'custom'
dashWeekOffset = 0   // ≤0 (0=current week, -1=last week, etc.)
dashMonthOffset = 0
dashYearOffset = 0
dashCustomFrom = ''  // YYYY-MM-DD
dashCustomTo = ''
dashFilters = Set<accountName | 'all'>
dashInsightTab = 'patterns'|'edge'|'score'

// Journal
jFilters = { session, instrument, resultat, dateFrom, dateTo, period, rNonProfitable, horsSession }
jAccFilters = Set<accountName | 'all'>
jViewMode = 'table'|'cards'

// Calendar
calY = number  // year
calM = number  // month (0-indexed)
calFilter = 'all'
calAccFilters = Set<accountName | 'all'>

// Cashflow
cfAccFilters = Set<accountName | 'all'>
cfFilters = { type: ''|'depot'|'payout' }

// Trade form state
editId = null | string
tConf = 1-5
tDir = ''|'Long'|'Short'
tScrHTF = ''  // URL
tScrMTF = ''
tScrLTF = ''
tTags = []

// Detail drawer navigation
_detailNavIds = string[]   // trade IDs for prev/next
_detailNavIdx = -1         // current index (-1 = no nav)

// Image zoom
_imgScale = 1

// Charts: destroyed before re-render
charts = {}   // { canvasId: Chart.js instance }
```

### 8.3 localStorage Keys

| Key | Content |
|---|---|
| `tradelog_v3` | Full DB object (JSON) |
| `tl_theme` | `'light'`\|`'dark'` |
| `tl_ai_cache` | `{ text, ts, truncated }` (6h TTL) |
| `gemini_api_key` | Gemini API key string |
| `tl_limits` | `{ maxTradesDay, maxDailyLoss, minStars, requireReason }` |
| `tl_disabled_accounts` | `string[]` of disabled account IDs |
| `tl_sb_color` | Sidebar color preset ID |

---

## 9. CHARTS

All charts use Chart.js 4.4. Each canvas tracked in `charts{}`, destroyed via `dc(id)` before re-render.

### Dashboard Charts

| Canvas ID | Type | Data | On Click |
|---|---|---|---|
| `cCapital` | Line | Equity curve (closed trades sorted by date) | — |
| `cTrades` | Bar | P&L per individual trade | `openDetail(trade.id)` |
| `cDist` | Doughnut | Win/Loss/BE distribution | — |
| `cSession` | Bar | P&L net by session | `openTradeListModal(sessionTrades, label)` |
| `cInstr` | Bar | P&L net by instrument | `openTradeListModal(instrTrades, label)` |
| `cDay` | Bar | P&L net by weekday | `openTradeListModal(dayTrades, label)` |
| `cStars` | Bar | Win rate by confidence ★ (1–5) | — |

### Report Charts

| Canvas ID | Type | Data |
|---|---|---|
| `rTopInstr` | Horizontal bar (custom) | Top instruments by P&L |
| `rHour` | Bar | P&L by hour of day |

### Capital Chart Details (`cCapital`)
- X axis: dates (DD/MM format)
- Dataset 1: Real equity curve (startCapital + cumulative PnL)
- Dataset 2: Rigueur curve (equity only from trades where stars ≥ 3 and !horsZone)
- Background color segments: green zone (above target) / neutral
- FTMO-style coloring: shade under curve green/red based on positive/negative drift

---

## 10. MODALS & DRAWERS

### Right Drawer (`#tradeModal`, class `.trade-drawer-overlay`)
**Used for:** New trade form | Edit trade form | Trade detail view
- `openNew()` — form mode, nav hidden
- `openEdit(id)` — form mode, nav hidden
- `dupTrade(id)` — form mode (pre-filled), nav hidden
- `openDetail(id)` — detail mode, nav shown if `_detailNavIds.length > 1`
- `closeModal('tradeModal')` — closes drawer
- ESC key closes (after closing image expand panel if open)
- Click backdrop closes

### Detail List Modal (`#detailModal`, class `.overlay`)
**Used for:** List of trades for a session/day/instrument (from chart clicks, calendar).
- `openTradeListModal(trades, title)` — opens list
- `openDayDetail(dateString)` — opens calendar day trades
- Clicking a trade → `closeModal('detailModal'); openDetail(id)`

### Image Modals
- **`#imgModal`** (`.overlay`): Full-screen preview (mobile + general fallback). `openImgPreview(url, label)`
- **`#imgExpandPanel`** (inside `#tradeModal`): Left-panel expansion (desktop only). `openImgExpand(url, label)`. Supports zoom (wheel) + pinch.

### Other Modals
- `#cfModal` — cashflow entry form
- `#accModal` — new account form
- `#renameAccModal` — rename account
- `#editCapModal` — edit start capital
- `#albumModal` — album view (screenshot gallery navigation per trade)

---

## 11. AI COACH

**Model:** Gemini 2.5 Flash
**Endpoint:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=...`
**Cache:** localStorage `tl_ai_cache`, TTL 6 hours
**API key:** User-entered in Settings, stored in `localStorage.gemini_api_key`
**Location:** Dashboard, below insights tabs (hidden if no key)

**Prompt structure:**
- System: Defines coach persona (Price Action / SMC specialist), rules (cite trade numbers, data-only, French)
- User: Last 20 closed trades as numbered text lines: `#N | date heure | instrument | direction | resultat | PnL | RR | Confiance | HORS-ZONE? | Raison`
- Context summary: W/L/BE counts, total PnL, hors-zone count

**Required output structure (5 sections):**
1. Ce qui a bien fonctionné
2. Points faibles détectés
3. Analyse discipline
4. Recommandations (3–5 actionable items)
5. Synthèse & Score de rigueur /10

**UI:** Markdown rendered via `marked.js` or simple regex. `refreshAICoach()` clears cache and re-fetches.

---

## 12. AUTH

**Supabase email/password auth.**
- Login screen (`#loginScreen`) shown on initial load if no session
- `sb.auth.getSession()` on init → if session exists, hide login and load app
- On login: `sb.auth.signInWithPassword({ email, password })`
- On logout: `sb.auth.signOut()`
- Auth state tracked by Supabase SDK

**`loadApp()` sequence:**
1. `sbLoadTrades()` — load trades from Supabase
2. `sbLoadAccounts()` — load accounts
3. `sbLoadCashflow()` — load cashflow
4. `sbLoadTags()` — load tags
5. Merge with localStorage defaults
6. `saveDB()` — persist to localStorage
7. `showPage('dashboard')` — render

---

## 13. EXPORT

**CSV** (`exportCSV()`):
Headers: `['ID','Compte','Date','Heure','Session','Instrument','Direction','Confiance (★)','Hors Zone','Montant Risqué','Gain/Perte','Capital','Résultat','RR','Pourquoi Entrer','Doute/Hésitation']`

Each row maps trade fields + capital snapshot at trade date (cumulative P&L on that account up to that date).

**JSON** (`exportJSON()`):
Full `DB` object as prettified JSON. Filename: `tradelog_YYYY-MM-DD.json`.

---

## 14. UI COMPONENTS CATALOG

### Buttons
- `.btn.btn-primary` — accent gradient, white text
- `.btn.btn-secondary` — surface background, border
- `.btn.btn-ghost` — transparent, text color
- `.btn-sm` — smaller padding
- `.btn-ghost.btn-sm` — icon-style ghost (used in table rows)

### Badges
- `.badge.badge-win` — green tint
- `.badge.badge-loss` — red/amber tint
- `.badge.badge-be` — amber tint
- `.badge.badge-encours` — blue tint

### Cards
- `.card` — white surface, border, border-radius, shadow
- `.card-head` — flex header with title + sub

### Form Elements
- `.field` — label + input wrapper
- `.sdiv` — section divider (horizontal rule with label)
- `.star-rating` — 5 clickable ★ spans (hover preview + click to set)
- `.toggle-group + .toggle-btn` — direction toggle (Long/Short), active states `.along` / `.ashort`
- `.rr-display` — read-only RR computed value display

### Tables
- `.jl-wrap > .jl-head.jl-cols + .jl-row.jl-cols` — journal list
- `.jl-hide-xs` / `.jl-hide-sm` / `.jl-hide-md` — responsive column hiding
- Standard HTML `table` for other pages

### Pills
- `.acc-pill` — account filter pill, active state uses account color as background
- `.dash-period-pill` — period filter pill

### Toast
`toast(msg, type)` — `#toast` element, classes: `show info|success|error|warning`, auto-hides after 3s.

### Audit Tooltip
`#audit-tip` — floating tooltip positioned via JS (`_posAuditTip`), shown on `_audit-badge` hover.

---

## 15. KEY ALGORITHMS — QUICK REFERENCE

```
Period Range:
  today     → { from: today, to: today }
  week      → Mon–Sun of current ISO week + weekOffset*7
  month     → 1st to today/end of month + monthOffset
  3months   → last 90 days
  year      → Jan 1 to today/Dec 31 + yearOffset
  all       → { from: '', to: '' } (no filter)

Account active check:
  getActiveAccounts() → DB.accounts.filter(a => !isAccDisabled(a.id))
  isAccDisabled(id) → localStorage 'tl_disabled_accounts' array includes String(id)

Stars backward compat:
  stars = trade.stars || (trade.confiance ? Math.max(1, Math.min(5, Math.round(confiance/2))) : null)

RR display:
  rr > 0  → green, "+N.NNR"
  rr < 0  → red, "-N.NNR"
  rr null → "—"

PnL display:
  pnl > 0 → green, "+$N.NN"
  pnl < 0 → red, "-$N.NN"

Streak calculation:
  Sort all closed trades by date+heure DESC
  Count consecutive same-result (Win or Loss) from most recent
```

---

## 16. REBUILD CHECKLIST

When rebuilding in another stack, implement in this order:

- [ ] **Data layer:** Supabase client, 4 tables, CRUD operations
- [ ] **Auth:** Login/logout, session persistence
- [ ] **Core models:** Trade, Account, Cashflow (exact field names matter for backward compat)
- [ ] **Business logic:** calcSession, calcHorsZone, calcRR, stats, maxDrawdown, expectancy, getDisciplineAudit
- [ ] **Dashboard:** KPI band, charts (7 types), today strip, insights tabs
- [ ] **Journal:** getFT filter, table+card views, badges, detail drawer
- [ ] **Detail/Form drawer:** Right-side panel, prev/next navigation, image expand
- [ ] **Calendar:** Month grid, day cells, weekly summaries
- [ ] **Cashflow + Accounts:** CRUD, capital calculation
- [ ] **Settings:** Theme, instruments, trading limits, AI key
- [ ] **AI Coach:** Gemini integration, caching, prompt format
- [ ] **Pattern detection:** 5 patterns (overtrading, killswitch, revenge, tilt, size escalation)
- [ ] **Export:** CSV + JSON
- [ ] **Responsive:** All breakpoints, mobile nav, drawer behavior
- [ ] **Themes:** Light + dark, CSS tokens

---

## 17. CONSTANTS

```js
SESSIONS    = ['Asian', 'London', 'New York', 'Hors session']
RESULTATS   = ['Win', 'Loss', 'Breakeven', 'En cours']
FORM_INSTRUMENTS = ['GER40', 'EURUSD', 'XAUUSD', 'GBPUSD']
WARN_INSTRUMENTS = ['USDJPY', 'EURJPY']
ACC_COLORS  = ['#2558CE','#8E6B1E','#2B8A4E','#8A5E12','#1E6A9A','#6B4F8A','#B05020','#4A6880']
STRATEGIES  = [
  { value: '1-trend',        label: '1 · TREND — Pro-HTF · Pro-MTF' },
  { value: '2-pullback',     label: '2 · PULLBACK — Counter-HTF · Pro-MTF' },
  { value: '2a-transition',  label: '2A · TRANSITION — Pro-HTF · Counter-MTF' },
  { value: '3-realignement', label: '3 · RÉALIGNEMENT — Swing ↔ Internal' }
]
TIMEZONE    = 'GMT+4' (all times are local to trader)
AI_CACHE_TTL = 6 * 3600 * 1000  // 6 hours in ms
GEMINI_MODEL = 'gemini-2.5-flash'
DEFAULT_LIMITS = { maxTradesDay: 3, maxDailyLoss: 150, minStars: 3, requireReason: true }
```

---

*Last updated: auto-generated from full code review of `app.js` (~3700 lines), `style.css` (~1420 lines), `index.html` (~510 lines).*
