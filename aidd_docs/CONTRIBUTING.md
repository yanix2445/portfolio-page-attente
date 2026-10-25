# Contributing to this project's AI context

Modalités d'évolution et d'enrichissement du contexte IA pour le projet **portfolio-page-attente** (`yanis-harrat.com`).

## Changing project memory

Ajouter ou modifier des fichiers sous [`aidd_docs/memory/`](memory/README.md). Voir [`memory/README.md`](memory/README.md) pour les règles d'organisation et de chargement.

- Toute modification de règle architecturale doit être reflétée dans [`architecture.md`](memory/architecture.md).
- Tout choix technique majeur doit faire l'objet d'un ADR dans [`decisions.md`](memory/decisions.md).
- Les mécanismes de sécurité et modèles de menace doivent être documentés dans [`security.md`](memory/security.md).
- Chaque nouvelle session d'ingénierie doit être consignée chronologiquement dans [`session-context.md`](memory/session-context.md).

## Adding AI content (skills, rules, agents, commands, hooks)

- Utiliser les compétences génératrices AIDD (`aidd-context:04-skill-generate` à `08-hook-generate`, et `10-learn` pour la mémoire ou les règles).
- Ouvrir une branche de travail dédiée (`antigravity/<action>`) pour toute modification modifiant le comportement des agents IA.
- Ne jamais committer directement sur `main`.

## House conventions

- **Typage strict :** TypeScript en mode `NodeNext` sans compromis (`noImplicitAny`, `strictNullChecks`).
- **Suppression sécurisée :** Obligation stricte d'utiliser `trash <chemin>` plutôt que des commandes destructives (`rm`).
- **Supervision locale :** Tout serveur ou tâche de fond doit être géré via **Portly**.
