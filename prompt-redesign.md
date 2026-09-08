# Prompt UI/UX : Refacto Apple HIG (HTML/CSS/JS Vanilla)

**Rôle :**
Agis en tant que Lead Frontend Engineer & UX Designer expert en HTML5, CSS3 et JavaScript vanilla, spécialisé dans la réplication des principes du design d'Apple (*Human Interface Guidelines*).

**Contexte & Objectif :**
J'ai une application SaaS existante composée d'un fichier HTML, d'un fichier CSS et d'un fichier JS. 
Ta mission est d'analyser le code existant, puis de le restructurer et de le restyler pour lui donner l'aspect, la fluidité et l'ergonomie d'une application iOS native (inspirée des apps Réglages, Santé et Fitness), **sans ajouter aucun framework ni aucune bibliothèque externe** (pas de React, Tailwind, Framer Motion, etc.).

---

## ÉTAPE 0 : Analyse préalable de l'existant (À réaliser OBLIGATOIREMENT avant le code)
Avant de rédiger ou modifier le moindre fichier, effectue une analyse de ce que je te fournis :
1. **Audit fonctionnel & DOM :** Identifie toutes les fonctionnalités existantes, les éléments du DOM (formulaires, tableaux, boutons) et la logique JS pour garantir qu'aucune fonction ne soit perdue.
2. **Cartographie de la refonte (Mapping) :** Propose une table de correspondance montrant comment chaque élément actuel sera transposé au format iOS (ex: *"Le menu header devient une Tab Bar basse"*, *"Le tableau de données devient une Inset Grouped List"*, *"Le formulaire de création devient une Bottom Sheet"*).
3. **Attends ma confirmation** ou enchaîne directement avec le code si je t'ai donné le feu vert.

---

## Directives d'implémentation :

### 1. Structure & Design Tokens (`style.css`)
* **Variables CSS (`:root`) :** Définis des variables CSS pour centraliser les couleurs (ex: `--bg-primary`, `--card-bg`, `--accent-blue`), les rayons de bordure (`--radius-card: 16px`), et la typographie.
* **Cartes & Groupes (*Inset Grouped Lists*) :** Organise le contenu dans des conteneurs avec coins arrondis (`border-radius: 16px`) sur fond légèrement décalé.
* **Dark Mode Natif :** Implémente le mode sombre OLED via la media query `@media (prefers-color-scheme: dark)` en redéfinissant uniquement les variables CSS.
* **Animations à ressort CSS :** Utilise des transitions CSS avec des béziers personnalisés pour simuler la physique d'iOS sans bibliothèque (ex: `transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)`).

### 2. Navigation & Ergonomie Mobile (`index.html` & `style.css`)
* **Tab Bar Basse :** Place la navigation principale dans un conteneur fixe en bas d'écran (`position: fixed; bottom: 0;`), basculant en barre latérale rétractable sur écran large via media query (`@media (min-width: 768px)`).
* **Bottom Sheets :** Pour l'édition ou la saisie de données, utilise des panneaux glissant depuis le bas activés par une classe CSS (`.sheet.open { transform: translateY(0); }`).
* **En-tête dynamique :** Utilise une structure où le grand titre (`h1`) se réduit et se fixe au sommet lors du défilement.

### 3. Interactions & Gestes (`script.js`)
* **Détection du défilement :** Utilise `window.addEventListener('scroll', ...)` ou `IntersectionObserver` pour piloter la réduction du grand titre au scroll.
* **Gestes Tactiles (Swipe) :** Écoute les événements tactiles natifs (`touchstart`, `touchmove`, `touchend`) pour permettre la fermeture des modales/sheets par glissement vers le bas.
* **Retour Haptique Natif :** Déclenche `navigator.vibrate(10)` lors des clics sur les interrupteurs, cartes interactives et boutons de validation.

### 4. Hiérarchie des Données & Clean UI
* **Lignes cliquables :** Utilise des éléments avec un chevron droit `›` à l'extrémité pour masquer la complexité derrière une navigation par sous-menus.
* **Synthèse visuelle :** Remplace les éléments textuels lourds par des jauges simples en CSS (`progress` ou `div` stylisées) et des chiffres clés en gras.

---

## Livrables attendus :
1. **L'analyse initiale et la cartographie** de l'existant.
2. **Les fichiers mis à jour** (`index.html`, `style.css`, `script.js`) sous forme de blocs de code complets, propres et directement intégrables.