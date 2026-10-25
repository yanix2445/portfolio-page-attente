# Contexte de Session & Historique des Échanges (AIDD)

Ce document consigne l'historique chronologique des sessions de développement, découpé par **sessions distinctes** avec leur identifiant de conversation, leur date et les demandes associées.

---

## Session 01 — 25 Octobre 2026

- **ID de Conversation Antigravity :** `b64c3018-d0ef-4c39-b4d8-13e8972fac00`
- **Lien conversationnel :** [Accéder au fil Antigravity](conversation://b64c3018-d0ef-4c39-b4d8-13e8972fac00)
- **Objectif global :** Migration TypeScript, blindage de sécurité (Turnstile/HMAC), Clean Architecture, optimisation WebP, README GFM et conformité légale (LCEN/RGPD).

### Lots de demandes traités lors de cette session :

#### Demande 1.1 : Clarification sur les templates Resend
- **Demande :** Les templates utilisés sont-ils ceux du compte Resend ou dans le code ? Pourquoi ne sont-ils pas publiés sur Resend ?
- **Réalisation :** Vérification et publication des templates sur le compte Resend. Génération dynamique du template de confirmation dans le code pour intégrer les signatures HMAC personnalisées.

#### Demande 1.2 : Migration complète vers TypeScript avec PNPM
- **Demande :** Migration des scripts JavaScript vers TypeScript avec les dernières versions et gestionnaire PNPM.
- **Réalisation :** Configuration de `package.json` (`typescript 7.0.2`, `@types/node 26.6.5`, `@vercel/node 27.0.2`), `tsconfig.json` en mode `NodeNext` strict, et typage des routes `api/subscribe.ts` et `api/unsubscribe.ts`.

#### Demande 1.3 : Blindage de sécurité de l'API contre les attaques
- **Demande :** Est-ce que notre API est protégée contre les attaques possibles ?
- **Réalisation :** Intégration de Cloudflare Turnstile en mode invisible, verrouillage des origines CORS sur `yanis-harrat.com`, signatures HMAC SHA-256 scellées pour la désinscription, rate-limiter IP en mémoire et honeypot.

#### Demande 1.4 : Restructuration Clean Architecture
- **Demande :** Revoir l'architecture complète pour passer sur une Clean Architecture.
- **Réalisation :** Extraction de la mascotte en base64 de 2,75 Mo hors de `index.html` vers un fichier statique (HTML réduit à 32 Ko). Découpage modulaire : `src/core/`, `src/infrastructure/`, `src/services/`, `src/templates/` et contrôleurs minces dans `api/`.

#### Demande 1.5 : Nettoyage des fichiers et branches obsolètes
- **Demande :** N'oublie pas de supprimer tout ce qui est devenu inutile.
- **Réalisation :** Suppression via `trash` des fichiers temporaires `COLD_EMAIL_SEQUENCE.md` et `WAITLIST_EMAIL_SEQUENCE.md`, et purge des 5 branches Git de travail fusionnées.

#### Demande 1.6 : Audit d'images & Optimisation WebP
- **Demande :** Pourquoi autant d'images (.png) ? Est-ce normal ? Audit SEO / AI-SEO.
- **Réalisation :** Diagnostic identifiant 1,17 Mo sur `logo.png` et 2,05 Mo sur `mascot.png`. Rangement dans un dossier dédié [`assets/`](../../assets/), conversion en WebP haute fidélité (`logo.webp` à 13 Ko, `mascot.webp` à 96 Ko, -96 % de poids) avec règles de réécriture dans `vercel.json`.

#### Demande 1.7 : Optimisation Sécurité, SEO, AI-SEO des fichiers de configuration
- **Demande :** Utiliser les plugins pour durcir `robots.txt`, `sitemap.xml`, `tsconfig.json` et `vercel.json`.
- **Réalisation :** En-têtes CSP, HSTS A+, Permissions-Policy, blocage de `/api/` dans `robots.txt`, directives pour les robots IA conversationnels, schéma Google Images dans `sitemap.xml`, et création du standard d'ingestion [`llms.txt`](../../llms.txt).

#### Demande 1.8 : Réécriture du README (Voix humaine, créative & GFM)
- **Demande :** Réécrire le README sans jargon d'IA, avec un style authentique, des diagrammes Mermaid (homelab et flux de sécurité), et suppression des séparateurs `---`.
- **Réalisation :** Rédaction à la première personne ancrée sur le profil de Yanis (BTS SIO SISR), intégration de 2 diagrammes Mermaid, dépliement par défaut de l'arborescence (`<details open>`).

#### Demande 1.9 : Création des pages légales obligatoires
- **Demande :** Ajouter les pages légales au strict minimum pour une conformité totale (LCEN & RGPD).
- **Réalisation :** Création de [`mentions-legales.html`](../../mentions-legales.html) (accessible sur `/mentions-legales`), zéro cookie publicitaire/traceur, identification de l'éditeur, de l'hébergeur Vercel et des sous-traitants Resend/Cloudflare. Lien ajouté dans le footer de `index.html`.

#### Demande 1.10 : Modèle de menace HMAC vs Turnstile & persistance `/10-learn`
- **Demande :** Pourquoi ne fait-on pas de HMAC sur l'inscription comme sur la désinscription ? Déclenchement de `/10-learn`.
- **Réalisation :** Formalisation de l'asymétrie entre action publique anonyme (protection Turnstile sans secret client) et action ciblée authentifiée (protection HMAC avec secret serveur). Consignation dans [`security.md`](security.md).

---

## Sessions Futures (Modèle d'incrémentation)

Chaque nouvelle session de travail incrémente ce document avec le format suivant :

```text
## Session [Numéro] — [Date]
- ID de Conversation Antigravity : [UUID de session]
- Lien conversationnel : conversation://[UUID]
- Objectif global : [Description]
### Lots de demandes traités :
#### Demande [Session.X] : [Titre]
- Demande : [Question utilisateur]
- Réalisation : [Actions et livrables]
```

---

## Paramètres & Clés Techniques du Projet

- **Cloudflare Account ID :** `2836a189208363c1c37584dac28f1547` (Yanislabs)
- **Cloudflare Turnstile Sitekey :** `0x4AAAAAAFkzHtilHfutyChR`
- **Cloudflare Turnstile Secret Key :** Configuré dans l'environnement Vercel (`TURNSTILE_SECRET_KEY`)
- **Resend Audience Segment ID :** `573be7ef-e507-4299-9de5-3ef2dc46917c`
- **Domaine principal vérifié :** `yanis-harrat.com` / `www.yanis-harrat.com`
