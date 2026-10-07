# Prompt — Appliquer le design system « Apple » à cette application

> À coller tel quel dans l'agent de code (Claude Code ou autre) ouvert sur l'application cible.

---

## Mission

Refonds **uniquement le design** de cette application pour qu'elle ait l'allure d'un produit conçu par les designers d'Apple (macOS / iOS). **Ne modifie aucun comportement fonctionnel** : pas de logique métier, pas de données, pas de routes, pas de noms de fonctions, pas d'API. Si un changement visuel exige de toucher au JS, limite-toi à la présentation (classes, libellés, couleurs, icônes) et signale-le.

## Méthode (dans cet ordre)

1. **Audit avant d'écrire.** Lis la structure (fichiers CSS, composants, thèmes existants, variables). Fais des captures de chaque page (desktop 1440px et mobile 390px, thème clair et sombre si présent) et liste ce qui ne va pas : couleurs incohérentes, styles cassés, débordements mobiles, emojis en guise d'icônes, petites capitales espacées, etc.
2. **Une seule couche de design, à la fin de la feuille de style** (ou dans un fichier chargé en dernier) pour gagner la cascade sans réécrire l'existant. Les anciens styles empilés avec `!important` doivent être surchargés explicitement dans cette couche.
3. **Tokens d'abord, composants ensuite.** Tout passe par des variables CSS ; aucune couleur codée en dur dans les composants.
4. **Vérifie visuellement après chaque étape** (captures desktop + mobile, clair + sombre). Le rendu prime sur la théorie.
5. **Documente** les tokens et les règles dans le fichier d'instructions du projet (CLAUDE.md ou équivalent).

---

## 1. Tokens (valeurs exactes)

Pose-les sur `body` (et `body[data-theme="dark"]` ou la classe de thème du projet) — pas seulement `:root` — afin de primer sur d'éventuelles variables injectées inline sur `<html>`.

```css
body{
  --bg:#F5F5F7; --bg2:#EEEEF1;
  --surface:#FFFFFF; --surface2:#FAFAFC; --surface3:#F2F2F5;
  --border:rgba(0,0,0,.09); --border2:rgba(0,0,0,.06);
  --text:#1D1D1F; --text2:#3A3A3C; --text3:#6E6E73; --text4:#8E8E93;
  --accent:#0071E3; --accent2:#0077ED; --accent-bg:rgba(0,113,227,.08); --accent-bd:rgba(0,113,227,.24);
  --green:#1F8A3B; --green-bg:rgba(52,199,89,.12); --green-bd:rgba(52,199,89,.28);
  --red:#E0281E;   --red-bg:rgba(255,59,48,.09);  --red-bd:rgba(255,59,48,.24);
  --amber:#C26A00; --amber-bg:rgba(255,149,0,.11); --amber-bd:rgba(255,149,0,.28);
  --fill:rgba(118,118,128,.12); --fill2:rgba(118,118,128,.08); /* gris système iOS */
  --seg-on:#FFFFFF;                                           /* segment actif */
  --r:10px; --rl:14px; --rxl:18px;
  --sh:0 0 0 .5px rgba(0,0,0,.05),0 1px 2px rgba(0,0,0,.04),0 4px 14px rgba(0,0,0,.035);
  --shl:0 0 0 .5px rgba(0,0,0,.05),0 2px 6px rgba(0,0,0,.05),0 14px 34px rgba(0,0,0,.08);
  --shfocus:0 0 0 4px rgba(0,113,227,.2);
  --header-bg:rgba(245,245,247,.78);
  --sans:-apple-system,BlinkMacSystemFont,'SF Pro Text','Inter','Segoe UI',system-ui,sans-serif;
  --display:-apple-system,BlinkMacSystemFont,'SF Pro Display','Inter','Segoe UI',system-ui,sans-serif;
  --sb-bg:#ECECEF; --sb-text:#3A3A3C; --sb-hover:rgba(0,0,0,.045); --sb-active-bg:rgba(0,0,0,.075);
}
body[data-theme="dark"]{
  --bg:#000000; --bg2:#0B0B0C;
  --surface:#1C1C1E; --surface2:#222224; --surface3:#2C2C2E;
  --border:rgba(255,255,255,.1); --border2:rgba(255,255,255,.065);
  --text:#F5F5F7; --text2:#D1D1D6; --text3:#98989D; --text4:#6E6E73;
  --accent:#0A84FF; --accent2:#409CFF; --accent-bg:rgba(10,132,255,.15); --accent-bd:rgba(10,132,255,.36);
  --green:#30D158; --green-bg:rgba(48,209,88,.14); --green-bd:rgba(48,209,88,.3);
  --red:#FF453A;   --red-bg:rgba(255,69,58,.14);  --red-bd:rgba(255,69,58,.3);
  --amber:#FF9F0A; --amber-bg:rgba(255,159,10,.14); --amber-bd:rgba(255,159,10,.3);
  --fill:rgba(118,118,128,.24); --fill2:rgba(118,118,128,.16);
  --seg-on:#636366;
  --sh:0 0 0 .5px rgba(255,255,255,.07);
  --shl:0 0 0 .5px rgba(255,255,255,.09),0 16px 40px rgba(0,0,0,.55);
  --shfocus:0 0 0 4px rgba(10,132,255,.3);
  --header-bg:rgba(0,0,0,.72);
  --sb-bg:#161618; --sb-text:#D1D1D6; --sb-hover:rgba(255,255,255,.06); --sb-active-bg:rgba(255,255,255,.1);
}
```

Règles : texte sur `--accent` **toujours blanc** ; le bleu est la couleur d'action, le vert/rouge/orange sont **sémantiques** (gain/perte/alerte) et ne servent jamais de décoration ; **plus aucune couleur héritée** d'une ancienne palette (chercher les bleus/ambres codés en dur dans focus, `::selection`, menu actif, boutons flottants…).

## 2. Typographie

- Police système (`--sans`), `font-size:13.5px`, `letter-spacing:-.006em`, `font-variant-numeric:tabular-nums` sur le body (chiffres alignés dans les tableaux).
- **Plus de police monospace pour les chiffres** : remplacer par la police système à chiffres tabulaires (si du monospace est imposé en `style=""` inline, le neutraliser avec un sélecteur d'attribut `[style*="NomDeLaPolice"]{font-family:var(--sans)!important}`).
- **Libellés en casse normale** : supprimer partout `text-transform:uppercase` + `letter-spacing` large sur les labels, en-têtes de tableaux, titres de cartes. Labels : 12px, poids 500, `--text3`.
- **Grand titre de page** façon iOS : 26px (28px mobile), poids 700, `letter-spacing:-.025em`, police `--display` ; sous-titre 12.5px `--text3`.
- Titres de carte : 16px, poids 600, casse normale. Titres de section de formulaire : 15px poids 600, comme l'app Réglages.
- Montants : un **seul format** dans toute l'app (ex. fr-FR `+$1 712,00`), via une fonction utilitaire unique ; les gros chiffres s'adaptent à leur conteneur (container queries `cqi` + `clamp()`) au lieu d'être tronqués.

## 3. Composants

| Composant | Spécification |
|---|---|
| **Sidebar** | Fond clair façon Finder (`--sb-bg`), hairline à droite, items arrondis 8px, **icônes en `--accent`**, item actif = fond gris `--sb-active-bg` (pas de barre colorée), sections étiquetées en casse normale (« Analyse », « Gestion »…), logo en carré arrondi dégradé bleu. |
| **Header** | Sticky, matériau translucide `backdrop-filter:saturate(180%) blur(20px)` sur `--header-bg`, hairline en bas. |
| **Cartes** | Sans bordure, `border-radius:18px`, ombre `--sh`, padding 20–22px. En-tête de carte transparent (pas de bandeau gris). |
| **Boutons** | Capsules (`border-radius:980px`). Primaire = fond `--accent`, texte blanc, sans ombre. Secondaire = fond `--fill`, sans bordure, texte `--text`. Ghost = transparent, fond `--fill2` au survol. |
| **Contrôles segmentés** | Pour tout choix exclusif (périodes, onglets, vues) : piste `--fill`, `border-radius:9px`, `padding:2px`, segment actif fond `--seg-on` + ombre `0 1px 3px rgba(0,0,0,.12)`. Remplace les onglets soulignés et les pilules colorées. |
| **Chips / filtres** | Capsules `--fill`, sans bordure, 12.5px poids 500. |
| **Champs** | Fond `--fill2`, bordure transparente, rayon 9px ; au focus : fond `--surface`, bordure `--accent`, anneau `--shfocus`. |
| **Badges** | Capsules **sans bordure**, fond teinté `-bg`, texte de la couleur sémantique, 11px poids 600. |
| **Tableaux** | Pas de zébrures, séparateurs hairline `--border2`, survol `--fill2`, en-tête transparent et collant si long. |
| **Modals / tiroirs** | Rayon 22px, ombre large, fond d'écran `rgba(0,0,0,.32)` ; bouton fermer = cercle 30px `--fill`. Sur mobile : **bottom sheet**. |
| **Toast** | Capsule sombre translucide (`rgba(29,29,31,.92)` + blur), texte blanc, pastille de couleur ● pour succès/erreur/alerte. |
| **Icônes** | **Aucun emoji** comme icône d'action : SVG trait 1.8px style SF Symbols (`currentColor`), gris `--text3`, couleur d'accent au survol, rouge seulement au survol de « supprimer ». Dans les listes, les actions apparaissent au survol de la ligne (comme Mail). |
| **Bouton flottant (+)** | Cercle 52px, `--accent`, texte blanc, ombre bleutée ; masqué sur les pages où il n'a pas de sens. |
| **États vides** | Carte centrée, titre 17px poids 600, sous-texte `--text3`. |

## 4. Graphiques (si l'app en a)

- Couleurs **lues depuis les tokens CSS** (`getComputedStyle(body).getPropertyValue('--green')`…) pour suivre le thème automatiquement.
- Police des charts = police système ; grilles hairline (`rgba(0,0,0,.05)` / `rgba(255,255,255,.07)`) ; pas d'axe en trait plein.
- Barres en **dégradé doux** (couleur pleine à l'extrémité, ~50 % d'opacité vers zéro), coins arrondis ; courbes 2px avec **remplissage en dégradé** qui s'efface vers la ligne de base ; animation d'entrée ~800 ms `easeOutQuart`.
- **Tooltips sombres macOS** (`rgba(29,29,31,.92)`, rayon 10, padding 12, titre en gras) et **enrichis** : date, contexte, valeur, cumul, nombre d'éléments.
- Palette catégorielle = couleurs système Apple dans cet ordre : `#0A84FF #5E5CE6 #30B0C7 #AF52DE #FF9500 #FF2D55 #00C7BE`.
- Garder les types de graphiques et les valeurs affichées existants sauf demande contraire ; si un graphique devient illisible avec beaucoup de données, **regrouper automatiquement** (ex. élément → jour → semaine → mois, ~25 barres max) plutôt que d'empiler des barres minuscules.
- Tout conteneur de canvas dans une grille : `min-width:0` (sinon le canvas élargit la carte).

## 5. Mobile = vraie app iOS (≤768px / ≤600px)

- Barre d'onglets en bas translucide (`rgba(249,249,249,.9)` + blur, hairline en haut), onglet actif en `--accent`.
- **Safe areas** : `viewport-fit=cover` + `env(safe-area-inset-top/bottom/left/right)` sur le header, la barre d'onglets et le bouton flottant (mode PWA `black-translucent`).
- Grand titre qui **se replie au scroll** de la fenêtre ; retour en haut à chaque changement d'onglet.
- Fenêtre ouverte (modal, tiroir) → la page derrière ne défile plus (`body:has(.modal.open){overflow:hidden}`) ; `overscroll-behavior:contain` sur les contenus défilants.
- Filtres et chips : **une rangée horizontale défilante** (pas de retour à la ligne) ; séries de cartes de synthèse : **carrousel** avec `scroll-snap` ; tableaux larges remplacés par des **cartes** ; contrôles segmentés pleine largeur.
- Inputs ≥16px (anti-zoom iOS), `-webkit-tap-highlight-color:transparent`, `touch-action:manipulation`, pas de sélection de texte sur les contrôles.
- `@media (prefers-reduced-motion:reduce)` : couper animations et transitions.

## 6. Pièges rencontrés (à éviter d'emblée)

- Des classes utilisées par le JS mais **absentes du CSS** (cartes non stylées) : vérifier chaque page, pas seulement l'accueil.
- Des tooltips de graphiques qui prenaient la couleur de la sidebar → illisibles quand la sidebar devient claire : fond de tooltip **fixe**.
- Des montants tronqués dans les KPI : tailles adaptatives (`clamp()` + `cqi`), jamais de taille fixe trop grande.
- Des éléments en double (même bouton dans le header et dans la page) : n'en garder qu'un.
- Ne jamais remplacer dans le code des chaînes contenant `$` avec `String.replace(str, str)` (motifs `$'`, `$&`) : utiliser une fonction de remplacement.

## Livrable attendu

1. La couche de design (tokens + composants + mobile) à la fin de la feuille de style.
2. Les éventuels ajustements de présentation dans les templates/JS (libellés, icônes SVG, classes) — **sans changement fonctionnel**.
3. Captures avant/après (desktop + mobile, clair + sombre) et la liste de ce qui a été corrigé.
4. Les règles du design system documentées dans le fichier d'instructions du projet.
