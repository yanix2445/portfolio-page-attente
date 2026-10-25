# AI Operating Guidelines

Lignes directrices opérationnelles pour les assistants IA (Antigravity, Codex, Claude Code) intervenant sur le dépôt **portfolio-page-attente**.

## House rules

- **Pas de régression sur le typage :** `pnpm run type-check` doit sortir avec un code retour 0 avant toute conclusion de tâche.
- **Interdiction absolue de `rm` :** Utiliser systématiquement la commande macOS `trash <fichier|dossier>`.
- **Isolation des branches :** Toujours inspecter la branche courante (`git branch --show-current`) et basculer sur une branche de travail dédiée (`antigravity/<action>`). Ne jamais pousser sur `main` sans validation explicite de l'utilisateur.
- **Sobriété et anti-slop :** Pas de dépendances npm inutiles. Préférer le code vanilla natif et les modules standards Node.js (`node:crypto`, `node:http`).
- **Supervision exclusive Portly :** Démarrer et inspecter les tâches de développement local avec `portly ...`.

## Validation depth

- **Modifications mineures (docs, styling) :** Validation TypeScript et contrôle visuel local.
- **Modifications d'API ou de sécurité :** Validation TypeScript, revue de sécurité cryptographique (`timingSafeEqual`), et vérification des variables d'environnement Vercel.

## When the AI drifts

- Stopper immédiatement les tool calls superflus.
- Consulter [`aidd_docs/memory/session-context.md`](memory/session-context.md) pour rétablir la chronologie exacte.
- Poser une question de clarification courte et ciblée si l'intention de l'utilisateur diverge.
