# CLAUDE.md — TradeLog

## Architecture des fichiers

| Fichier | Lignes | Rôle |
|---|---|---|
| `index.html` | ~570 | HTML pur — structure, pages, modals, visionneuse |
| `style.css` | ~2020 | CSS pur — tout le design et les thèmes |
| `app.js` | ~4150 | JS pur — toute la logique |
| `src/` | — | React migration (incomplète, ne pas toucher sauf demande) |

**Règle absolue : toujours éditer ces 3 fichiers. Ne jamais toucher `src/` sauf demande explicite.**

> Les numéros de ligne ci-dessous sont **indicatifs** (ils dérivent à chaque modification).
> Toujours chercher par nom de fonction. La TOC en tête de `app.js` (L.1–38) est **obsolète**.

---

## Où chercher quoi — guide rapide

| Tâche | Fichier | Zone |
|---|---|---|
| Modifier un thème (couleurs) | `style.css` | L.8–110 (`:root` = clair, `body[data-theme="dark"]`) |
| Ajouter du CSS | `style.css` | **à la fin** pour gagner la cascade |
| Modifier le layout HTML / menu | `index.html` | sidebar `.sb-nav`, menu mobile `#mobileNav` |
| Navigation entre pages | `app.js` | `showPage()` ~L.340, `PTitles` ~L.315 |
| Modifier le dashboard | `app.js` | `renderDash()` ~L.536 |
| Modifier les charts | `app.js` | `renderCharts()` ~L.1101 |
| Modifier les couleurs de charts | `app.js` | `getChartTheme()` ~L.789 |
| Modifier le rapport | `app.js` | `renderReport()` ~L.1911 |
| Modifier la discipline | `app.js` | `getDisciplineAudit()` ~L.667 |
| Modifier le journal | `app.js` | `renderJournal()` ~L.1978 / `renderJTable()` ~L.2090 / `renderJCards()` ~L.2173 |
| Modifier la saisie trade | `app.js` | `openNew()` / `dupTrade()` / `openEdit()` ~L.2234 / `buildForm()` ~L.2282 / `saveTrade()` ~L.2438 |
| Modifier le détail d'un trade | `app.js` | `openDetail()` ~L.2507 |
| Modifier la visionneuse plein écran | `app.js` | section `SCREENSHOT VIEWER` ~L.3840 |
| Modifier le calendrier | `app.js` | `renderCal()` ~L.2572 |
| Modifier les comptes | `app.js` | `renderAccounts()` ~L.2807 |
| Modifier la page Anomalies | `app.js` | `getAnomalies()` / `renderAnomalies()` ~L.369 |
| Modifier les paramètres | `app.js` | `renderSettings()` ~L.3024 |
| Raccourcis clavier | `app.js` | section `RACCOURCIS CLAVIER` (`NAV_KEYS`) ~L.3823 |
| Constantes / état global | `app.js` | ~L.109–140 |

---

## Design system — « Apple » (2 thèmes)

Thème stocké dans `document.body.dataset.theme`. Persisté dans `localStorage.tl_theme` (`'light'` | `'dark'`, toute autre valeur → `'light'`).
**Le thème « Or » n'existe plus.**

| Thème | `data-theme` | Caractère |
|---|---|---|
| **Clair** | `''` | Gris neutres Apple (`#F5F5F7`), surfaces blanches, accent bleu système |
| **Sombre** | `"dark"` | Noir pur, surfaces `#1C1C1E` (macOS), accent bleu système clair |

**Où sont les tokens** : la couche finale `DESIGN SYSTEM v2 — « Apple »` à la **fin de `style.css`**. Les tokens y sont posés sur `body` / `body[data-theme="dark"]` (et non `:root`) pour primer sur le `--sb-bg` que `applySbColor()` met en inline sur `<html>`. Les anciens blocs `:root` (L.8–110) et la couche « APPLE HIG LAYER » sont écrasés — **modifier les couleurs dans la couche v2**.

Principes : typographie système (`-apple-system` / SF Pro, Inter en repli) à **chiffres tabulaires** (plus de DM Mono — `--mono` pointe sur `--sans`, et les `style="…DM Mono…"` inline sont neutralisés), libellés en **casse normale** (plus de petites capitales espacées), grands titres de page (26px), cartes sans bordure avec ombre hairline, contrôles segmentés iOS, champs à fond gris (`--fill2`), boutons capsule, sidebar claire façon macOS (icônes en `--accent`), icônes d'action SVG (`ICO.dup/edit/del` dans `app.js`, plus d'emoji).

### Tokens CSS — toujours utiliser `var(--token)`, jamais hardcoder

| Token | Rôle |
|---|---|
| `--bg`, `--bg2` | Fond de page |
| `--surface`, `--surface2`, `--surface3` | Cartes / panneaux (élévation) |
| `--border`, `--border2` | Bordures principale / subtile |
| `--text`, `--text2`, `--text3`, `--text4` | Hiérarchie texte |
| `--accent`, `--accent2`, `--accent-bg`, `--accent-bd` | Couleur action principale |
| `--green / --red / --amber / --gold / --blue` | Sémantique + variantes `-bg` `-bd` |
| `--fill` / `--fill2` | Remplissages gris système (chips, segmentés, champs, boutons secondaires) |
| `--seg-on` | Fond du segment actif d'un contrôle segmenté |
| `--sb-bg`, `--sb-text`, `--sb-hover`, `--sb-active-bg` | Sidebar |
| `--header-bg` | Header sticky translucide |
| `--r` / `--rl` / `--rxl` | Border radii (10/14/18px) |
| `--sh` / `--shl` / `--shfocus` | Ombres (hairline + diffuse) / anneau de focus |
| `--sans` / `--display` / `--mono` | Polices système (`--mono` = `--sans`) |
| `--hdr-h` | Hauteur du header (posée en JS, pour les en-têtes collants) |

### Valeurs clés par thème

| Token | Clair | Sombre |
|---|---|---|
| `--bg` | `#F5F5F7` | `#000000` |
| `--surface` | `#FFFFFF` | `#1C1C1E` |
| `--accent` | `#0071E3` | `#0A84FF` |
| `--text` / `--text3` | `#1D1D1F` / `#6E6E73` | `#F5F5F7` / `#98989D` |
| `--green` / `--red` / `--amber` | `#1F8A3B` / `#E0281E` / `#C26A00` | `#30D158` / `#FF453A` / `#FF9F0A` |
| `--sb-bg` | `#ECECEF` | `#161618` |

### Règles de couleur & composants

- Texte sur `--accent` : **blanc** dans les deux thèmes.
- Boutons : `.btn-primary` = capsule bleue ; `.btn-secondary` = capsule grise (`--fill`), sans bordure.
- Badges, chips, toggles : capsules **sans bordure** (fond teinté `-bg`).
- Périodes / onglets insights / vue journal = **contrôle segmenté** (`--fill` + segment `--seg-on`).
- Toast = capsule sombre translucide avec pastille de couleur (succès/erreur/alerte).
- Tooltips Chart.js = fond fixe `rgba(29,29,31,.92)`, rayon 10 (ne plus utiliser `--sb-bg`).
- Palette catégorielle (`mkBar` uniquement) = couleurs système Apple (`#0A84FF`, `#5E5CE6`, `#30B0C7`, `#AF52DE`, `#FF9500`, `#FF2D55`, `#00C7BE`). Les gains/pertes utilisent `--chart-win`/`--chart-loss`.
- `color-mix(in srgb, …)` et container queries (`cqi`, taille des KPI) sont utilisés.

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

**Style « éditorial » (data-journalisme)** : `getChartTheme()` lit des tokens **dédiés aux charts** dans la couche v2 de `style.css` : `--chart-win` (vert désaturé), `--chart-loss` (rouge désaturé — convention finance vert = gain / rouge = perte, ne pas en sortir), `--chart-mid` (gris, BE / série secondaire), `--chart-muted`. Ils sont distincts de `--green`/`--red` (KPI, texte) → modifier les couleurs des charts ici, pas dans `--green`/`--red`. `ct.muted` est aussi exposé.

### Finitions des charts
- Barres pâles + liseré plein : `backgroundColor:_gradArr(couleurs)` renvoie un remplissage translucide (`_barAlpha()` : .28 clair / .38 sombre) ; le plugin global `edBars` dessine un **liseré 2px** plein à l'extrémité (verticales, y.c. barres flottantes) ou une **pastille** en bout (horizontales `indexAxis:'y'` → lollipop, `barThickness:4`). `borderRadius:1`.
- Axes discrets via `Chart.defaults.scale` (pas de trait d'axe ni de graduations) ; ligne de zéro légèrement renforcée sur `rInstr`/`cTrades`.
- Courbe de capital : pas de légende → **étiquettes directes en bout de courbe** (`capEndPlugin` : « Réel » coloré, « Rigueur » en gris, écartées si elles se chevauchent) ; ligne pointillée annotée « Capital de départ, $X » (`capRefPlugin`) ; courbe Rigueur en `ct.mid` pointillée ; remplissage en dégradé léger (`capGradPlugin`). Animation d'entrée 800 ms et style de tooltip communs posés sur `Chart.defaults`.
- `cTrades` : seuls le meilleur et le pire net sont annotés (étiquette maintenue dans le cadre). `rInstr` : couleur selon le signe (plus de palette arc-en-ciel).
- Tooltips enrichis : capital (trade du point, R, variation), P&L par période (gains, pertes, net ; trade : instrument, R, compte), R multiples (P&L de la tranche), instruments (`mkGainChart(..., groups)` → win rate + RR moyen), confiance et W/L/BE (P&L).
- `cTrades` = **barres divergentes** (carte « P&L par période ») : par période, gains empilés au-dessus de zéro et pertes en dessous (2 datasets `stack:'pl'`), **trait du net** (`pl_net`) quand la période mélange gains et pertes, repère gris pour une période nulle. Remplace l'ancienne cascade (le cumul est déjà porté par la courbe de capital). Granularité : **jour** par défaut ; trade si une seule journée ; semaine (>31 jours) ; mois (>26 semaines). Clic = trade (detail) ou liste des trades de la période.
- `rHour` n'est plus un canvas : **bande de chaleur HTML** dans `#rHourWrap` (une case par heure, sessions au-dessus, intensité = |P&L|, clic → `openTradeListModal`, survol → `showAuditTip`). Styles `.hs-*`.
- Helpers : `_cssVar(name)`, `_rgba(couleur, alpha)` (hex ou rgb).

---

## Formatage — règles

- **Montants USD : toujours `fmtUSD(n, sign=true, dec=2)`** → `+$1 712,00` / `-$300,00` / `$0,00` (format fr-FR). `sign=false` pour un montant sans « + » (capital, risque).
- Cellules étroites : `fmtUSDk(n)` → `+$1,7k`.
- Ne plus écrire `'$'+x.toFixed(2)` ni `x+'$'` (anciens formats supprimés).
- Dates : `fmtD('YYYY-MM-DD')` → `JJ/MM/AAAA`. Libellé long : `toLocaleDateString('fr-FR',{weekday:'long',…})`.
- RR : `fmtN(rr,2)+'R'` avec signe explicite.

---

## Structure HTML (`index.html`)

```
<head>  fonts / Chart.js CDN / Supabase CDN / favicon inline SVG
<link rel="stylesheet" href="style.css"/>
<body>
  <aside class="sidebar">
    .sb-section-label "Analyse"  → Dashboard, Rapport, Journal, Calendrier
    .sb-section-label.sb-sub "Gestion" → Cashflow, Comptes, Stratégie, Anomalies (+ .anom-badge)
    .sb-divider → Paramètres
  <main class="main">
    <div class="page-header">  sticky (#pageTitle, #pageSub, #headerActions)
    <div class="page-content">
      #page-dashboard  #page-report  #page-journal  #page-calendar
      #page-cashflow   #page-accounts  #page-rules  #page-anomalies  #page-settings
  #mobileNav  (Dashboard, Rapport, Journal, Calendrier, Plus → #mobileMoreMenu)
  #fab  (bouton + → openNew)
  #tradeModal   drawer trade (saisie / édition / détail) + #imgExpandPanel
  #tlViewer     visionneuse plein écran des captures
  [modals .overlay: cfModal, accModal, renameAccModal, editCapModal, detailModal, imgModal, albumModal]
  #loadingScreen (icône app + courbe de capital SVG qui se dessine en boucle, styles `.ls-*` ; thème posé par un script inline juste après <body> pour éviter le flash)  #loginScreen  #toast  #audit-tip
<script src="app.js"></script>
```

**Ajouter une page** : bouton `.sb-item[data-page]` (+ `.mn-more-item` mobile), `<div id="page-xxx" class="page">`, entrée dans `PTitles`, appel `renderXxx()` dans `showPage()`, éventuellement `NAV_KEYS`.

---

## Modals & fermeture

- `closeModal(id)` ferme un `.overlay` ou le drawer.
- **`#tradeModal` (saisie/détail trade) ne se ferme QUE par ✕ / Annuler / Enregistrer / Fermer** : pas de clic backdrop, pas d'Échap, pas de swipe-down. Ne pas réintroduire.
- Les autres `.overlay` se ferment au clic backdrop et à Échap.
- `#tlViewer` se ferme par ✕ ou Échap (n'affecte pas le drawer dessous).

---

## État global (`app.js`)

```js
DB = { trades[], accounts[], cashflow[], tags[], instruments[], rules[], checklists[] }

dashFilters / jAccFilters / calAccFilters / cfAccFilters = Set<accountName|'all'>
dashPeriod     = 'today'|'week'|'month'|'3months'|'year'|'all'|'custom'
dashCustomFrom/To = ''  // YYYY-MM-DD
dashWeekOffset / dashMonthOffset / dashYearOffset = 0  // <0 = passé

jFilters = { session, instrument, resultat, dateFrom, dateTo, period }
cfFilters = { type }
calY, calM

editId, tConf, tDir, tTags[], tScrHTF, tScrMTF, tScrLTF   // formulaire trade
_detailNavIds[], _detailNavIdx   // liste de nav ‹ › du drawer détail (posée par renderJTable/renderJCards/renderAnomalies)
_tlv = { ids, idx, tf, s, x, y, … }   // état visionneuse
albumTrades[], albumIdx, albumImgMode
charts = {}   // instances Chart.js, clé = canvas id
curPage = 'dashboard'
```

Filtres **supprimés** (ne pas réintroduire) : `rNonProfitable`, `horsSession`, `isRNonProfitable()`, `isHorsSession()`, badges « HORS SESSION » / « R NON PROFITABLE ».

---

## Fonctions clés (`app.js`)

| Fonction | Rôle |
|---|---|
| `showPage(p)` | Navigation ; rend la page + `updateAnomalyBadge()` |
| `saveDB()` | localStorage + `updateAnomalyBadge()` |
| `getActiveAccounts()` | Comptes non désactivés (les trades des comptes désactivés/inexistants sont exclus partout) |
| `getFT()` | Source unique des trades filtrés journal |
| `getDashRange()` | `{from,to}` dashboard selon période + offsets |
| `stats(f)` | `{total,wins,losses,be,pnl,winRate,avgRR}` |
| `calcRR(t)` / `calcPnl(t)` | gainPerte / montantRisque ; P&L numérique |
| `calcSession(heure)` | Asian 0–7h, London 7–13h, New York 13–18h, sinon « Hors session » |
| `calcHorsZone(heure)` | Hors killzone (London 11–14h, NY 16:30–19:30 GMT+4) |
| `getDisciplineAudit(f)` | `{score,undisciplined[],…}` |
| `getChartTheme()` | Palette couleurs selon thème actif |
| `dc(id)` | Détruire instance Chart.js avant re-render |
| `setTheme(t)` | `'light'`/`'dark'` |
| `esc(s)` | Échapper HTML |
| `fmtD` / `fmtN` / `fmtUSD` / `fmtUSDk` | Formatage (voir section Formatage) |
| `openDetail(id)` | Drawer détail trade (nav ‹ › via `_detailNavIds`) |
| `dupTrade(id)` | Duplique un trade **avec ses captures**, reset date/heure/gainPerte/resultat |
| `openViewer(id,tf)` / `closeViewer()` | Visionneuse plein écran |
| `getAnomalies()` / `assignTradeAccount()` / `assignAllAnomalies()` | Page Anomalies |
| `calOpenWeek(from,to)` | Clic colonne semaine du calendrier → journal filtré |
| `viewAccount(name,page)` | Ouvre dashboard/journal filtré sur un compte |
| `openAlbumView(id)` | Modal album (ancienne vue screenshot + détails) |

---

## Rendu par page

| Page | Fonction principale | Notes |
|---|---|---|
| Dashboard | `renderDash()` | filtres compte/période → bande KPI hiérarchisée (`.kb-hero` : P&L de la période en grand + % du capital + mini-courbe SVG + capital ; `.kb-grid` : 6 indicateurs secondaires, couleur seulement si alerte `.bad`/`.warn`) → `renderCharts` (capital ; P&L par période + distribution R côte à côte) → `renderEnCours` → insights (toujours visibles, pas de section repliable : données consultées souvent) |
| Rapport | `renderReport()` | partage `dashFilters`/`dashPeriod` avec le dashboard |
| Journal | `renderJournal()` | `renderJAccPills` → `renderJFilters` → `renderJSummary` → `renderJTable` (groupé **par jour** avec en-tête `.jl-day`, colonne **Risque**, en-tête `.jl-head` collant) ou `renderJCards` |
| Calendrier | `renderCal()` | grille 7 jours + **colonne Semaine** (`.cal-8`, `.cal-wk`), heatmap d'intensité P&L |
| Cashflow | `renderCashflow()` | cartes `.cf-sum-card` ; bouton « Nouveau mouvement » uniquement dans le header |
| Comptes | `renderAccounts()` | cartes `.acc2` : capital actuel, %, sparkline SVG, stats, boutons Dashboard/Journal |
| Stratégie | `renderRules()` → `renderStrategy()` | |
| Anomalies | `renderAnomalies()` | trades sans compte / compte inexistant ; badge rouge `.anom-badge` sidebar + mobile |
| Paramètres | `renderSettings()` | |

---

## Visionneuse plein écran (`#tlViewer`)

- Ouverte par : clic sur une capture du drawer détail, ou sur la vignette d'une ligne du journal.
- Navigue parmi `_detailNavIds` **ayant au moins une capture** ; garde le même TF d'un trade à l'autre (fallback si absent).
- Clavier (capture, prioritaire) : ←/→ trade, ↑/↓ ou 1/2/3 TF, +/−/0 zoom, F plein écran, Échap.
- Souris : molette/pinch trackpad = zoom vers le curseur, clic = zoom ×2.5, drag = pan.
- Tactile : pinch, double-tap zoom, swipe ←/→ trade, swipe ↑/↓ TF, tap = masquer l'UI.
- Préchargement des captures du trade courant et des voisins. Au close, le drawer se resynchronise sur le dernier trade vu.

---

## Calculateur de position (`#pcModal`, section `CALCULATEUR DE POSITION` dans `app.js`)

- Ouvert par `openPosCalc()` : touche **P**, entrée « Calculateur » de la sidebar, menu « Plus » mobile.
- Compte en USD : `lots = risque$ ÷ (distance × valeur $/unité/lot)`, arrondi à 0.01 **inférieur**. Specs dans `PC_INSTR` :
  EURUSD/GBPUSD 10 $/pip · XAUUSD `oz/lot` $ par 1,00 $ (défaut 100) · GER40 `€/point/lot` (défaut 1) × EUR/USD.
- Tailles de contrat modifiables dans le calculateur (`localStorage.tl_pc_specs`). Taux EUR/USD : BCE via `api.frankfurter.app` (cache 6 h, `tl_eurusd`), saisie manuelle possible.
- Risque en % du **solde** (`getAccBalance` = capital de départ + P&L, hors cashflow) ou en $. Préférences dans `tl_pc` ; les prix ne sont pas persistés.
- Mode Prix (entrée/stop/TP → sens Long/Short déduit, R:R) ou Distance. « Créer le trade » ouvre le formulaire pré-rempli (compte, instrument, sens, montant risqué réel, RR attendu).

## Raccourcis clavier (desktop)

`N` nouveau trade · `P` calculateur de position · `D` Dashboard · `R` Rapport · `J` Journal · `C` Calendrier · `A` Anomalies.
Inactifs pendant la saisie (input/select/textarea) et quand un modal/drawer/visionneuse est ouvert.

---

## Supabase

Tables : `trades`, `accounts`, `cashflow`, `tags`

```js
// trades : une ligne par trade
{ id, data: <TradeObject>, updated_at }   // colonne data = JSON complet

// accounts
{ id, name, start_capital, color, updated_at }

// cashflow
{ id, type, date, compte, montant_usd, montant_mur, taux, note, updated_at }

// tags
{ name }
```

Credentials : constantes `SUPABASE_URL` + `SUPABASE_KEY` au début de `app.js` (clé `anon` → RLS doit être activé côté Supabase).

**Points faibles connus (non corrigés)** :
- `sbUpsertTrade` & co. ne font que `console.error` en cas d'échec → le toast « sauvegardé ✓ » s'affiche quand même.
- `refreshApp()` / `loadApp()` remplacent `DB.trades` par la liste serveur → un trade jamais synchronisé peut être perdu.

---

## Trade — champs

```
id, compte, date (YYYY-MM-DD), heure (HH:MM), session, instrument, direction ('Long'|'Short')
strategie ('1-trend'|'2-pullback'|'2a-transition'|'3-realignement'), structure ('solide'|'fragile'|null)
horsZone (bool), stars (1–5), montantRisque, gainPerte, rr, expectedRR
resultat ('Win'|'Loss'|'Breakeven'|'En cours'), pourquoiEntrer, douteHesitation
screenshotHTF, screenshotMTF, screenshotLTF (URL), tags[]
```

Compat ascendante : `screenshotAvant`/`screenshot` → HTF, `screenshotApres` → MTF ; `structureSolide` (bool) → `structure` ; `confiance` (1–10) → `stars` via `Math.round(confiance/2)`.

---

## Discipline

- **Hors zone** : `calcHorsZone(heure)` → London 11–14h, NY 16:30–19:30 GMT+4 — persisté sur le trade
- **Trade indiscipliné** = `horsZone===true` OU `structure==='fragile'` OU `stars<3` → badge « ⚠ INDISCIPLINE » (tooltip via `getAuditReasons`)

---

## Responsive

**RÈGLE ABSOLUE : toute nouvelle fonctionnalité DOIT être testée et fonctionner sur mobile (≤768px) et tablette (≤1100px). Ne jamais ajouter de layout sans vérifier la cascade responsive.**

| Breakpoint | Changements |
|---|---|
| ≤1280px | `.charts-row` → 2 cols |
| ≤1100px | Grilles 2 cols, `.cf-summary` 2 cols, hint clavier visionneuse masqué |
| ≤900px | Tout 1 col, sidebar 200px, `#reportMetricsRow` 2 cols, calendrier en montants compacts (`.cal-short`) |
| ≤768px | Sidebar cachée, hamburger + `#mobileNav` visibles, margin-left:0 |
| ≤600px | Journal en cartes, calendrier compact (méta masquées, « Sem. »), pills période défilantes, inputs 16px (anti-zoom iOS) |
| ≤480px | `.disc-banner` 2 cols, stats comptes 2 cols, paddings réduits |
| ≤420px | J-cards forcé 1 col |

### Comportement « app iOS » (section `MOBILE — comportement d'app iOS` en fin de `style.css`)
- Safe areas : header/FAB/contenu paddés avec `env(safe-area-inset-*)` (PWA `black-translucent`).
- Grand titre qui se replie au scroll de la **fenêtre** (`header-compact`), retour en haut à chaque changement d'onglet.
- `body[data-page]` posé par `showPage()` → le FAB est masqué sur cashflow/comptes/stratégie/paramètres/anomalies.
- Fenêtre ouverte (`.overlay`, drawer, visionneuse) → `body` ne défile plus (`:has`).
- ≤600px : chips compte et filtres journal en **rangée horizontale défilante**, synthèse journal en **carrousel**, cashflow en **cartes** (`.cf-cards`, le tableau est masqué), segmenté période pleine largeur.
- Pas de flash au toucher / zoom double-tap (`touch-action:manipulation`). Inputs ≥16px (anti-zoom iOS).

### Règles anti-overflow mobile
- Enfants de grilles contenant un canvas : `min-width:0` (sinon Chart.js élargit la carte).
- `html{overflow-x:hidden}` sur `html` uniquement — PAS sur `body` (bug Safari iOS)
- Les media queries `.charts-row` ont `!important` pour écraser les `style=""` inline
- Tables larges (leaderboard, cashflow, day-table) : toujours entourer d'un `overflow-x:auto`
- Nouveaux grids inline (`style="grid-template-columns:..."`) : toujours ajouter la règle CSS correspondante avec `!important` dans un `@media`
- `.jl-wrap` utilise `overflow:clip` (pas `hidden`) pour garder l'en-tête collant
- Colonnes du journal (`.jl-cols`, bloc en fin de `style.css`) : dernière colonne `auto` (les boutons d'action sont **toujours visibles au tactile** — masqués seulement sous `@media(hover:hover)`), montant/RR/heure avec une largeur minimale. Tester avec les actions visibles (Chrome desktop les masque).

### Hamburger & iOS PWA
- `#hamburger` : `display:none` par défaut, `display:flex` à ≤768px
- iOS standalone : `touchend` listener + `transform:translateZ(0)` + `isolation:isolate` sur `.hamburger`

### Page Rapport — IDs responsive à maintenir
- `#reportMetricsRow` (≤1100px: 3col, ≤900px: 2col)
- `#reportTopInstrCard` (overflow-x:auto à ≤600px)
- `#rInstrWrap` (overflow-x:auto à ≤600px pour les barres horizontales)
- `#rDay` (font réduit à ≤600px)

---

## Charts — canvas

| ID | Page | Contenu |
|---|---|---|
| `cCapital` | Dashboard | Courbe capital réelle + rigueur |
| `cDrawdown` | Dashboard | Drawdown sous la courbe capital |
| `cTrades` | Dashboard | P&L par période en barres divergentes gains / pertes + trait du net (jour / semaine / mois ; trade si une seule journée) |
| `cRDist` | Dashboard | Distribution des R multiples |
| `rInstr` | Rapport | Gain net par instrument (barres horizontales) |
| `rDist` | Rapport | Distribution W/L/BE |
| `rStars` | Rapport | Win rate par niveau ★ |
| `rHour` | Rapport | Gain net par heure — **bande de chaleur HTML** (plus de canvas) |

Toujours appeler `dc(id)` avant de rendre dans un canvas existant.

---

## Constantes (`app.js`)

```js
KEY = 'tradelog_v3'
SESSIONS    = ['Asian','London','New York','Hors session']
RESULTATS   = ['Win','Loss','Breakeven','En cours']
ETATS       = ['Calme','Confiant','Stressé','Impatient','Focalisé','Fatigue']
STRUCTURES  = ['BOS haussier','BOS baissier','ChoCH haussier','ChoCH baissier','Range','Tendance','Autre']
FORM_INSTRUMENTS = ['GER40','EURUSD','XAUUSD','GBPUSD']
ACC_COLORS  = ['#2558CE','#8E6B1E','#2B8A4E','#8A5E12','#1E6A9A','#6B4F8A','#B05020','#4A6880']
TLV_TFS     = ['htf','mtf','ltf']
NAV_KEYS    = { d:'dashboard', r:'report', j:'journal', c:'calendar', a:'anomalies' }
```

---

## AI Coach

- `fetchAIInterpretation(trades)` — Gemini (`GEMINI_MODEL='gemini-2.5-flash'`), 20 derniers trades
- Cache 6h : `localStorage.tl_ai_cache` (invalidé si `AI_PROMPT_VER` change dans `init()`)
- Clé API : `localStorage.gemini_api_key` (page Paramètres)

---

## Tester sans se connecter

L'app exige une session Supabase. Pour vérifier un rendu :
- Node est installé (`C:\Program Files\nodejs\node.exe`) mais **absent du PATH de Git Bash** → utiliser PowerShell : `node --check app.js`.
- Rendu visuel : copier `index.html` dans un dossier temporaire avec chemins absolus `file:///` vers `style.css`/`app.js`, ajouter un script qui masque `#loginScreen`/`#loadingScreen`, injecte des trades factices dans `DB` puis appelle `showPage(...)`, et capturer avec Chrome headless :
  `chrome --headless=new --allow-file-access-from-files --window-size=1440,900 --virtual-time-budget=6000 --screenshot=out.png file:///…`
- Chrome headless ne descend pas sous ~500px de large → pour le mobile, charger la page dans une `<iframe>` de 390px.

---

## React `src/` (migration incomplète)

- `src/App.tsx` — router useState, état local (pas Supabase)
- `src/types/trade.ts`, `src/config/constants.ts`
- `src/hooks/` — `useFilteredTrades`, `usePerformanceAudit`
- `src/components/` — Journal, DisciplineBanner, DashboardFilters, Sidebar, TradeForm

Toutes les pages sauf dashboard et journal affichent "en cours de migration".
