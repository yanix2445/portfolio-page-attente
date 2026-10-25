# Contexte Intégral & Synthèse de la Session

## 1. Identifiants de la Session
- **ID de Conversation Antigravity :** `b64c3018-d0ef-4c39-b4d8-13e8972fac00`
- **Lien conversationnel :** [Accéder à la conversation Antigravity](conversation://b64c3018-d0ef-4c39-b4d8-13e8972fac00)
- **Dépôt GitHub :** `https://github.com/yanix2445/portfolio-page-attente`
- **URL de Production :** `https://www.yanis-harrat.com`
- **Branche principale :** `main`

---

## 2. Déroulement Chronologique des Demandes Utilisateur & Réponses

### Demande 1 : Clarification sur les templates Resend
- **Question utilisateur :** Les templates utilisés sont-ils ceux du compte Resend ou dans le code ? Pourquoi ne sont-ils pas publiés sur Resend ?
- **Action réalisée :** Explication de la publication des templates Resend (`161b9f72-81a9-4582-97e4-6c17636e348d`, `a3803c02-66ef-4234-9f02-41d1ed6e9697`, `e05633b4-4c4d-45fc-a418-edb3f72d282a`) et démonstration de la génération dynamique du template de confirmation dans le code pour y insérer les signatures de désinscription sécurisées.

### Demande 2 : Migration des scripts JS vers TypeScript avec PNPM
- **Question utilisateur :** Est-ce possible de migrer les scripts JS vers TypeScript ? Utiliser les dernières versions avec PNPM.
- **Action réalisée :** Configuration de `package.json` avec TypeScript 7.0.2, `@types/node 26.6.5`, `@vercel/node 27.0.2`, configuration de `tsconfig.json` en mode `NodeNext` strict, et migration de `api/subscribe.js` et `api/unsubscribe.js` en `.ts`.

### Demande 3 : Audit & Blindage de Sécurité contre les attaques
- **Question utilisateur :** Est-ce que notre API est protégée contre les attaques possibles ?
- **Action réalisée :** Mise en place d'un plan de sécurisation validé par l'utilisateur :
  - Intégration de Cloudflare Turnstile en mode invisible (widget et siteverify serveur).
  - Verrouillage CORS strict sur `https://www.yanis-harrat.com`.
  - Signature cryptographique HMAC SHA-256 avec comparaison à temps constant pour les liens de désinscription.
  - Rate limiting glissant par adresse IP et honeypot.

### Demande 4 : Refactorisation Clean Code Architecture
- **Question utilisateur :** Revoir l'architecture complète pour passer sur du Clean Code, présentation puis validation.
- **Action réalisée :**
  - Extraction de la mascotte en base64 (2,75 Mo) hors de `index.html` vers `mascot.png` (réduction du HTML à 32 Ko).
  - Découpage en couches : `src/core/` (types, validation pure, erreurs), `src/infrastructure/` (Resend, Turnstile, Config, Sécurité), `src/services/` (subscription, unsubscribe, rate-limiter), `src/templates/` (confirmation).
  - Simplification des contrôleurs dans `api/` devenus de simples aiguilleurs HTTP minces.

### Demande 5 : Nettoyage des fichiers et branches obsolètes
- **Question utilisateur :** N'oublie pas de supprimer tout ce qui est devenu inutile.
- **Action réalisée :** Suppression des 5 branches Git locales temporaires déjà fusionnées (`antigravity/clean-architecture`, etc.), mise à la corbeille via `trash` des anciens fichiers de prospection `COLD_EMAIL_SEQUENCE.md` et `WAITLIST_EMAIL_SEQUENCE.md`.

### Demande 6 : Audit SEO & Diagnostic des images multiples
- **Question utilisateur :** Pourquoi autant d'images (.png) ? Est-ce normal ? Audit SEO / AI-SEO.
- **Action réalisée :** Audit révélant que sur 7 fichiers, seuls 2 sont affichés à l'écran (les 5 autres étant des favicons et Open Graph). Identification d'un problème de poids (`logo.png` à 1,17 Mo et `mascot.png` à 2,05 Mo).
- **Solution appliquée :** Rangement dans un dossier dédié [`assets/`](file:///Users/yanis/Developer/portfolio-page-attente/assets), conversion en WebP haute fidélité (`logo.webp` à 13 Ko, `mascot.webp` à 96 Ko, -96 % de poids), règles de réécriture dans `vercel.json` et balises `<picture>`.

### Demande 7 : Optimisation Sécurité, SEO, AI-SEO & Clean Code des configs
- **Question utilisateur :** Utiliser les plugins pour optimiser la sécurité, le SEO, l'AI-SEO et le Clean Code sur `robots.txt`, `sitemap.xml`, `tsconfig.json` et `vercel.json`.
- **Action réalisée :**
  - `vercel.json` : Ajout des en-têtes CSP, HSTS A+, Permissions-Policy, Referrer-Policy, et cache CDN 1 an sur `/assets/*`.
  - `robots.txt` : Blocage de `/api/` et autorisation explicite des robots d'indexation conversationnels IA (`PerplexityBot`, `ChatGPT-User`, `Claude-SearchBot`, etc.).
  - `sitemap.xml` : Schéma d'images Google `xmlns:image`.
  - `llms.txt` : Création du fichier d'ingestion IA (Agent Readiness) à la racine.
  - `tsconfig.json` : Activation des flags TypeScript stricts.

### Demande 8 : Réécriture du README.md (Humanisation & Anti-AI-slop)
- **Question utilisateur :** Réécrire le README avec un ton humain, authentique, naturel, pro, moderne, créatif, sans aucun marqueur d'IA ni formule bateau.
- **Action réalisée :**
  - Rédaction à la première personne ancrée sur le profil réel de Yanis (BTS SIO SISR Aurlom, alternance 3j/2j).
  - Élimination des badges muraux, de la soupe d'émojis et du jargon corporate.
  - Intégration de diagrammes Mermaid interactifs pour l'infrastructure Homelab physique et le flux de sécurité.
  - Dépliement par défaut de l'arborescence du projet via `<details open>`.
  - Retrait des séparateurs `---` superflus pour une lecture aérée.

### Demande 9 : Création des pages légales obligatoires
- **Question utilisateur :** Utiliser les plugins pour ajouter toutes les pages légales au strict minimum pour une conformité totale.
- **Action réalisée :** Création de [`mentions-legales.html`](file:///Users/yanis/Developer/portfolio-page-attente/mentions-legales.html) (accessible sur `/mentions-legales`), regroupant la conformité LCEN (éditeur, hébergeur Vercel, sous-traitants Resend/Cloudflare), la politique RGPD complète (finalité, conservation, droits de désinscription 1 clic, CNIL) et l'absence totale de cookies publicitaires ou de pistage. Lien intégré dans le footer de `index.html`.

---

## 3. Paramètres & Clés Techniques du Projet
- **Cloudflare Account ID :** `2836a189208363c1c37584dac28f1547` (Yanislabs)
- **Cloudflare Turnstile Sitekey :** `0x4AAAAAAFkzHtilHfutyChR`
- **Cloudflare Turnstile Secret Key :** Configuré dans l'environnement Vercel (`TURNSTILE_SECRET_KEY`)
- **Resend Audience Segment ID :** `573be7ef-e507-4299-9de5-3ef2dc46917c`
- **Domaine principal vérifié :** `yanis-harrat.com` / `www.yanis-harrat.com`
