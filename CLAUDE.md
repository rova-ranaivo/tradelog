# CLAUDE.md — TradeLog

## Architecture des fichiers

| Fichier | Lignes | Rôle |
|---|---|---|
| `index.html` | ~450 | HTML pur — structure, pages, modals |
| `style.css` | ~1750 | CSS pur — tout le design et les thèmes |
| `app.js` | ~2649 | JS pur — toute la logique (TOC L.1–42) |
| `src/` | — | React migration (incomplète, ne pas toucher sauf demande) |

**Règle absolue : toujours éditer ces 3 fichiers. Ne jamais toucher `src/` sauf demande explicite.**

---

## Où chercher quoi — guide rapide

| Tâche | Fichier | Zone |
|---|---|---|
| Modifier un thème (couleurs) | `style.css` | lignes 8–220 (3 blocs `:root` / `dark` / `gold`) |
| Ajouter du CSS | `style.css` | **à la fin** pour gagner la cascade |
| Modifier le layout HTML | `index.html` | — |
| Modifier les charts | `app.js` | `renderCharts()` L.932 |
| Modifier les couleurs de charts | `app.js` | `getChartTheme()` L.617 |
| Modifier le dashboard | `app.js` | `renderDash()` L.379 |
| Modifier le journal | `app.js` | `renderJournal()` L.1439 / `renderJTable()` L.1588 |
| Modifier la discipline | `app.js` | `getDisciplineAudit()` L.452 / `renderDisciplineBanner()` L.468 |
| Modifier les modals trade | `app.js` | `openTradeModal()` L.1650 / `buildForm()` L.1685 |
| Modifier le calendrier | `app.js` | `renderCalendar()` L.1926 |
| Modifier l'album | `app.js` | `renderAlbum()` L.2411 |
| Modifier les paramètres | `app.js` | `renderSettings()` L.2244 |
| Constantes / état global | `app.js` | L.111 |

---

## Système de thèmes — 3 thèmes

Thème stocké dans `document.body.dataset.theme`. Persisté dans `localStorage.tl_theme`.

| Thème | `data-theme` | Caractère |
|---|---|---|
| **Clair** | `''` (`:root`) | Institutionnel, bleu accent |
| **Sombre** | `"dark"` | Vrai dark, accents néon |
| **Or** | `"gold"` | Luxe lumineux, Alabaster & Gold (iOS style) |

### Tokens CSS — toujours utiliser `var(--token)`, jamais hardcoder

| Token | Rôle |
|---|---|
| `--bg`, `--bg2` | Fond de page |
| `--surface`, `--surface2`, `--surface3` | Cartes / panneaux (élévation) |
| `--border`, `--border2` | Bordures principale / subtile |
| `--text`, `--text2`, `--text3`, `--text4` | Hiérarchie texte |
| `--accent`, `--accent2`, `--accent-bg`, `--accent-bd` | Couleur action principale |
| `--green / --red / --amber / --gold / --blue` | Sémantique + variantes `-bg` `-bd` |
| `--sb-bg`, `--sb-active-bar` | Sidebar |
| `--header-bg` | Header sticky |
| `--r` / `--rl` / `--rxl` | Border radii |
| `--sh` / `--shl` / `--shfocus` | Ombres |
| `--sidebar` | Largeur sidebar |

### Valeurs clés par thème

| Token | Clair | Sombre | Or (Alabaster) |
|---|---|---|---|
| `--bg` | `#F5F7FA` | `#0C0E14` | `#FDFBF7` |
| `--surface` | `#FFFFFF` | `#131720` | `#FFFFFF` |
| `--accent` | `#2558CE` | `#3B82F6` | `#B38F37` |
| `--text` | `#161D2E` | `#D4DCEA` | `#1C1C1E` |
| `--sb-bg` | `#1C3461` | `#080A0F` | `#12100D` |
| `--sb-active-bar` | `#60A5FA` | `#3B82F6` | `#D4AF37` |
| `--header-bg` | `rgba(245,247,250,.94)` | `rgba(12,14,20,.94)` | `rgba(253,251,247,.8)` + blur |
| `--r` / `--rl` / `--rxl` | 5/8/12px | 5/8/12px | **7/11/16px** (iOS) |

### Spécificités thème Or (Alabaster & Gold)

- Header : glassmorphism Apple `backdrop-filter:blur(20px)`
- Boutons primaires : dégradé `linear-gradient(135deg,#B38F37,#D4AF37)` + ombre `rgba(154,123,54,.28)`
- Sidebar : deep midnight `#12100D` avec accents `#D4AF37`
- Ombres ultra-douces : `0 4px 18px rgba(154,123,54,.05)`
- Ces overrides sont dans `style.css` après le bloc `body[data-theme="gold"]{...}`

### Couleurs charts — `getChartTheme()` dans `app.js`

```js
const ct = getChartTheme();
ct.win / ct.loss          // couleur texte/ligne
ct.winBg / ct.lossBg      // fond barres
ct.winFill / ct.lossFill  // fill area (capital chart)
ct.midBg                  // Breakeven
ct.emptyBg                // barres vides
ct.grid                   // gridlines
ct.ttBorder               // bordure tooltip
```

**Toujours mettre à jour `getChartTheme()` si on change les couleurs P&L d'un thème.**

---

## Structure HTML (`index.html`)

```
<head>  fonts / Chart.js CDN / Supabase CDN / favicon inline SVG
<link rel="stylesheet" href="style.css"/>
<style></style>  ← vide, réservé
<body>
  <aside class="sidebar">  navigation fixe
  <main class="main">
    <div class="page-header">  sticky
    <div class="page-content">
      #page-dashboard   .page.active
      #page-journal     .page
      #page-calendar    .page
      #page-cashflow    .page
      #page-accounts    .page
      #page-rules       .page
      #page-settings    .page
  [modals: tradeModal, detailModal, imgModal, albumModal, accModal, editCapModal...]
  #loadingScreen
  #loginScreen
  #toast
  #fab  (bouton +)
<script src="app.js"></script>
```

---

## État global (`app.js`)

```js
DB = { trades[], accounts[], cashflow[], tags[], instruments[], rules[], checklists[] }

dashFilters    = Set<accountName|'all'>
dashPeriod     = 'today'|'week'|'month'|'3months'|'year'|'all'|'custom'
dashCustomFrom/To = ''  // YYYY-MM-DD
dashWeekOffset = 0  // <0 = passé
dashMonthOffset= 0
dashYearOffset = 0

jFilters = { session, instrument, resultat, dateFrom, dateTo, period, rNonProfitable, horsSession }
jAccFilters    = Set<accountName|'all'>
calAccFilters  = Set<accountName|'all'>
cfAccFilters   = Set<accountName|'all'>
cfFilters      = { type }
calY, calM, calFilter

editId, tConf, tDir, tTags[], tScrHTF, tScrMTF, tScrLTF
albumTrades[], albumIdx, albumImgMode = 'htf'|'mtf'|'ltf'
charts = {}   // instances Chart.js, clé = canvas id
curPage = 'dashboard'
```

---

## Fonctions clés (`app.js`)

| Fonction | Rôle |
|---|---|
| `getFT()` | Source unique des trades filtrés journal |
| `getDashRange()` | `{from,to}` dashboard selon période + offsets |
| `stats(f)` | `{total,wins,losses,be,pnl,winRate,avgRR}` |
| `calcRR(t)` | gainPerte / montantRisque |
| `calcSession(heure)` | Label session depuis HH:MM |
| `calcHorsZone(heure)` | Hors killzone (London 11–14h, NY 16:30–19:30 GMT+4) |
| `getDisciplineAudit(f)` | `{score,undisciplined[],cntHz,cntConf,cntFrag}` |
| `getChartTheme()` | Palette couleurs selon thème actif |
| `dc(id)` | Détruire instance Chart.js avant re-render |
| `setTheme(t)` | `'light'`/`'dark'`/`'gold'` — met à jour body.dataset.theme |
| `esc(s)` | Échapper HTML |
| `fmtD(d)` / `fmtN(n,dec)` | Formatage date / nombre |
| `openAlbumView(id)` | Modal album (screenshot + détails trade) |
| `openDetail(id)` | Modal détail trade simple |

---

## Rendu par page

| Page | Fonction principale | Sous-appels |
|---|---|---|
| Dashboard | `renderDash()` | `renderPills` → `renderDashFilter` → hero KPIs → `renderDisciplineBanner` → `renderCharts` → `renderEnCours` → `renderDashBottom` → `renderAICoach` |
| Journal | `renderJournal()` | `renderJAccPills` → `renderJFilters` → `renderJSummary` → `renderJTable` |
| Calendrier | `renderCal()` | `renderCalAccPills` |
| Cashflow | `renderCashflow()` | `renderCFAccPills` |
| Comptes | `renderAccounts()` | — |
| Règles | `renderRules()` | `renderRTab` + `renderCTab` |
| Paramètres | `renderSettings()` | — |

---

## Charts — tous les canvas

| ID | Type | Contenu |
|---|---|---|
| `cCapital` | Line | Courbe capital réelle + rigueur, coloration FTMO |
| `cSession` | Bar | P&L net par session — clic → liste trades |
| `cTrades` | Bar | P&L par trade individuel — clic → openDetail |
| `cInstr` | Bar | P&L net par instrument — clic |
| `cDay` | Bar | P&L net par jour de semaine — clic |
| `cDist` | Doughnut | Distribution W/L/BE |
| `cStars` | Bar | Win rate par niveau ★ (1–5) |

Toujours appeler `dc(id)` avant de rendre dans un canvas existant.

---

## Supabase

Tables : `trades`, `accounts`, `cashflow`, `tags`

```js
// trades : une ligne par trade
{ id, data: <TradeObject> }   // colonne data = JSON complet

// accounts
{ id, name, start_capital, color, updated_at }

// cashflow
{ id, type, date, compte, montant_usd, montant_mur, taux, note, updated_at }

// tags
{ name }
```

Credentials : constantes `SUPABASE_URL` + `SUPABASE_KEY` au début de `app.js`.

---

## Trade — champs

```
id, compte, date (YYYY-MM-DD), heure (HH:MM), session, instrument, direction
structure ('solide'|'fragile'|null), horsZone (bool), stars (1–5)
montantRisque, gainPerte, rr, resultat ('Win'|'Loss'|'Breakeven'|'En cours')
etat, pourquoiEntrer, douteHesitation
screenshotAvant (URL), screenshotApres (URL), tags[]
```

Compat ascendante : `structureSolide` (bool) → `structure` ; `confiance` (1–10) → `stars` via `Math.round(confiance/2)`.

---

## Discipline

- **Hors zone** : `calcHorsZone(heure)` → London 11–14h, NY 16:30–19:30 GMT+4 — persisté sur le trade
- **Trade indiscipliné** = `horsZone===true` OU `structure==='fragile'` OU `stars<3`
- **Session filter** (journal seulement, non persisté) : `isHorsSession()` — London 10–13h, NY 16:30–19h

---

## Responsive

| Breakpoint | Changements |
|---|---|
| ≤1100px | Grilles 2 cols |
| ≤900px | Charts 1 col, sidebar 200px |
| ≤768px | Sidebar cachée, hamburger visible, margin-left:0 |
| ≤600px | Journal en cartes |
| ≤480px | `.disc-banner` 2 cols, paddings réduits |

**Hamburger** : présent (`#hamburger`), `display:none` par défaut, `display:flex` à ≤768px.
**overflow-x fix** : `html{overflow-x:hidden}` uniquement sur `html` — pas sur `body` (bug Safari iOS).

---

## Constantes (`app.js`)

```js
KEY = 'tradelog_v3'
SESSIONS    = ['Asian','London','New York','Hors session']
RESULTATS   = ['Win','Loss','Breakeven','En cours']
ETATS       = ['Calme','Confiant','Stressé','Impatient','Focalisé','Fatigue']
STRUCTURES  = ['BOS haussier','BOS baissier','ChoCH haussier','ChoCH baissier','Range','Tendance','Autre']
FORM_INSTRUMENTS = ['EURUSD','GBPUSD','XAUUSD','GBPJPY','EURJPY','USDJPY','NZDUSD','NASDAQ']
ACC_COLORS  = ['#2558CE','#8E6B1E','#2B8A4E','#8A5E12','#1E6A9A','#6B4F8A','#B05020','#4A6880']
```

---

## AI Coach

- `fetchAIInterpretation(trades)` — Gemini 2.5-flash, 20 derniers trades
- Cache 6h : `localStorage.tl_ai_cache`
- Clé API : `localStorage.gemini_api_key` (page Paramètres)
- `renderAICoach(f)` → `#dashAICoach` (caché si pas de clé)
- `refreshAICoach()` → vide le cache et re-fetch

---

## React `src/` (migration incomplète)

- `src/App.tsx` — router useState, état local (pas Supabase)
- `src/types/trade.ts`, `src/config/constants.ts`
- `src/hooks/` — `useFilteredTrades`, `usePerformanceAudit`
- `src/components/` — Journal, DisciplineBanner, DashboardFilters, Sidebar, TradeForm

Toutes les pages sauf dashboard et journal affichent "en cours de migration".
