# Documentation Projet & Mémoire AIDD

Ce dossier centralise la mémoire vivante, les conventions architecturales, les spécifications de sécurité et l'historique des décisions techniques du projet **portfolio-page-attente** (`yanis-harrat.com`).

## Organisation

- [`memory/`](memory/README.md) : Banques de mémoire actives du projet, lues par les agents IA (Antigravity, Codex, Claude Code).
  - [`architecture.md`](memory/architecture.md) : Clean Code Architecture, typage TypeScript 7 strict et découplage des couches.
  - [`security.md`](memory/security.md) : Spécifications de sécurité (Turnstile invisible, HMAC SHA-256, CORS, CSP, HSTS, Rate Limit).
  - [`decisions.md`](memory/decisions.md) : Registre des décisions d'architecture (ADR) prises lors des sessions de développement.
  - [`session-context.md`](memory/session-context.md) : Contexte intégral et synthèse de la session de refactorisation.
  - [`internal/`](memory/internal/) : Notes et contextes internes spécialisés.
  - [`external/`](memory/external/) : Références et documentations externes.
