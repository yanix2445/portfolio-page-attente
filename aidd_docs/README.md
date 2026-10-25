# Documentation Projet & Mémoire AIDD

Ce dossier centralise la mémoire vivante, les conventions architecturales, les spécifications de sécurité et l'historique des décisions techniques du projet **portfolio-page-attente** (`yanis-harrat.com`).

## Organisation

- [`INSTALL.md`](INSTALL.md) : Spécification d'architecture, vision technique et guide d'installation du projet.
- [`CONTRIBUTING.md`](CONTRIBUTING.md) : Modalités de contribution et d'évolution du contexte IA.
- [`GUIDELINES.md`](GUIDELINES.md) : Lignes directrices et règles opérationnelles pour les agents IA.
- [`memory/`](memory/README.md) : Banques de mémoire actives du projet, lues par les agents IA (Antigravity, Codex, Claude Code).
  - [`project-brief.md`](memory/project-brief.md) : Vision, intention produit et vocabulaire du domaine.
  - [`architecture.md`](memory/architecture.md) : Clean Code Architecture, typage TypeScript 7 strict et découplage des couches.
  - [`codebase-map.md`](memory/codebase-map.md) : Cartographie des modules et points d'entrée du code source.
  - [`coding-assertions.md`](memory/coding-assertions.md) : Commandes de vérification et portes d'intégrité avant commit/push.
  - [`testing.md`](memory/testing.md) : Stratégie de tests, outillage et assurance qualité navigateur.
  - [`vcs.md`](memory/vcs.md) : Stratégie de branches, conventions de commit et flux Git.
  - [`ecosystem.md`](memory/ecosystem.md) : Cartographie des services tiers (Vercel, GitHub, Resend, Cloudflare, Portly).
  - [`api.md`](memory/api.md) : Contrats des endpoints Serverless (`/api/subscribe`, `/api/unsubscribe`).
  - [`deployment.md`](memory/deployment.md) : Hébergement Vercel, pipeline de déploiement continu et en-têtes réseau.
  - [`security.md`](memory/security.md) : Spécifications de sécurité (Turnstile invisible, HMAC SHA-256, CORS, CSP, HSTS).
  - [`decisions.md`](memory/decisions.md) : Registre des décisions d'architecture (ADR) prises lors des sessions.
  - [`design.md`](memory/design.md) : Tokens CSS, dark theme et optimisation des assets graphiques.
  - [`forms.md`](memory/forms.md) : Validation formulaire, honeypot et gestion des états d'interface.
  - [`session-context.md`](memory/session-context.md) : Contexte chronologique par session de travail.
  - [`internal/`](memory/internal/) : Notes et contextes internes spécialisés.
  - [`external/`](memory/external/) : Références et documentations externes.
