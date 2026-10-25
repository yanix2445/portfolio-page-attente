# Registre des Décisions Techniques (ADR)

## ADR-001 : Migration complète vers TypeScript 7 et PNPM
- **Date :** 2026-10-25
- **Contexte :** Les scripts initiaux étaient en JavaScript non typé (`api/subscribe.js`, `api/unsubscribe.js`), avec risque d'erreurs runtime sur les payloads Resend.
- **Décision :** Migration intégrale vers TypeScript 7.0.2 avec module `NodeNext`, gestionnaire de paquets PNPM 12 et script `pnpm run type-check`.
- **Statut :** Accepté et déployé.

## ADR-002 : Découplage de l'asset Mascotte (Sortie du Base64 Inline)
- **Date :** 2026-10-25
- **Contexte :** `index.html` contenait une chaîne base64 inline de plus de 2,75 Mo, pénalisant lourdement le parsing DOM et le LCP mobile.
- **Décision :** Extraction vers un fichier statique externe `mascot.png` puis conversion en WebP `assets/mascot.webp`.
- **Conséquence :** `index.html` allégé de 2 757 Ko à **32 Ko** (gain de 98,8 %). Mascotte passée de 2,05 Mo à **96 Ko** en WebP avec cache CDN 1 an.
- **Statut :** Accepté et déployé.

## ADR-003 : Sécurisation de l'API avec Cloudflare Turnstile & HMAC SHA-256
- **Date :** 2026-10-25
- **Contexte :** L'API était vulnérable à l'email bombing et n'importe quel tiers pouvait forcer la désinscription d'un contact en fournissant son email en paramètre GET.
- **Décision :**
  - Validation obligatoire d'un token Cloudflare Turnstile invisible pour l'inscription.
  - Signature cryptographique HMAC SHA-256 scellée avec `crypto.timingSafeEqual` pour chaque lien de désinscription.
  - Whitelisting strict des origines CORS (`yanis-harrat.com`).
- **Statut :** Accepté et déployé.

## ADR-004 : Restructuration Clean Architecture
- **Date :** 2026-10-25
- **Contexte :** La logique de sécurité, la validation d'email, les appels Resend et le formatage des templates étaient tous entassés dans un fichier de 400 lignes dans `api/`.
- **Décision :** Découpage en 4 couches modulaires : `src/core/` (types, validation pure), `src/infrastructure/` (clients tiers), `src/services/` (cas d'usage), `src/templates/` (rendu) et contrôleurs fins dans `api/`.
- **Statut :** Accepté et déployé.

## ADR-005 : Réorganisation du dossier `assets/` et Variantes WebP
- **Date :** 2026-10-25
- **Contexte :** 7 fichiers images vivaient en vrac à la racine du dépôt, dont deux images surdimensionnées (`logo.png` à 1,17 Mo, `mascot.png` à 2,05 Mo).
- **Décision :** Déplacement de toutes les images dans [`assets/`](file:///Users/yanis/Developer/portfolio-page-attente/assets), génération de versions WebP haute fidélité (`logo.webp` à 13 Ko, `mascot.webp` à 96 Ko) et règles de réécriture transparentes dans `vercel.json` pour préserver les URLs publiques.
- **Statut :** Accepté et déployé.

## ADR-006 : Conformité Légale Maximale & Zéro Cookie
- **Date :** 2026-10-25
- **Contexte :** Nécessité d'une conformité stricte avec la LCEN française et le RGPD européen sans dégrader l'expérience utilisateur par un bandeau de cookies.
- **Décision :** Création d'une page unique [`mentions-legales.html`](file:///Users/yanis/Developer/portfolio-page-attente/mentions-legales.html) accessible via `/mentions-legales`, spécifiant l'identité de l'éditeur (Art. 6 LCEN), l'hébergeur Vercel, les sous-traitants Resend/Cloudflare, la finalité des données et l'absence totale de cookies publicitaires ou de traçage.
- **Statut :** Accepté et déployé.
