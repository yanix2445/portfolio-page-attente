# Design

Identité visuelle, charte graphique et tokens CSS du projet.

## System

- **Approche :** Design tokens CSS déclarés via variables natives (`:root`) dans [`index.html`](../../index.html) et [`mentions-legales.html`](../../mentions-legales.html).
- **Thème :** Dark theme natif, sobre et contrasté, inspiré de l'ingénierie système et cloud.

## Tokens

- **Couleurs principales :**
  - Fond sombre : `#0a0a0c`
  - Cartes et conteneurs : `#121216`
  - Bordures subtiles : `rgba(255, 255, 255, 0.08)`
  - Texte principal : `#f4f4f5`
  - Texte atténué : `#a1a1aa`
  - Accent / Bouton primaire : Dégradé sombre et reflets subtils
- **Typographie :**
  - Police système moderne (`system-ui`, `-apple-system`, `BlinkMacSystemFont`, `Inter`, `sans-serif`).
  - Échelle hiérarchique : H1 percutant, corps de texte lisible à 16px, interligne 1.5.

## Assets & Visuels

- **Mascotte :** Fichier statique optimisé [`assets/mascot.webp`](../../assets/mascot.webp) (96 Ko, vs 2,05 Mo à l'origine).
- **Logo :** [`assets/logo.webp`](../../assets/logo.webp) (13 Ko).

## Accessibility (a11y)

- Ratios de contraste conformes WCAG AA (texte clair sur fond sombre).
- Navigation au clavier complète (`:focus-visible` distinct avec anneau de contour).
- Éléments de formulaire pourvus de labels accessibles ou `aria-label`.
