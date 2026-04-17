# TradeLog — Changelog

Suivi des modifications apportées à l'application `index.html`.

---

## [2026-04-17] — Journal : redesign liste style Jira Backlog

### Changements
- **Journal** : remplacement des cartes (`.j-card`) par une liste tabulaire compacte inspirée du backlog Jira
  - Colonnes : miniature screenshot · Instrument · Date · Compte · Session · RR · Gain/Perte · Actions
  - Indicateur coloré (Win/Loss/BE/En cours) en bordure gauche de chaque ligne
  - Thumbnail 56×36px du `screenshotAvant` (ou `screenshotApres` en fallback) sur chaque ligne
  - Clic sur la miniature → ouvre l'image en plein écran via `openImgPreview()`
  - Icône image placeholder (SVG) si aucun screenshot disponible
  - Boutons Modifier/Supprimer visibles au survol de la ligne
  - Densité desktop améliorée : padding réduit, gap supprimé entre lignes

### Fichiers modifiés
- `index.html` — CSS (section `JOURNAL LIST JIRA STYLE`) + JS (`renderJTable()`)

---

## À faire / idées futures

- [ ] Tri des colonnes cliquable (date, RR, gain/perte)
- [ ] Pagination ou virtualisation pour de nombreux trades
- [ ] Ligne groupée par date (ex: "Lundi 14 avril — 3 trades")
- [ ] Export PDF du journal
- [ ] Affichage du tag setup dans la liste
