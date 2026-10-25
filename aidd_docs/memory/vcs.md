# VCS

Conventions de versionnage Git appliquées sur le projet.

## Setup

- **Branche principale :** `main`
- **Plateforme distante :** GitHub (`yanisharrat/portfolio-page-attente`)
- **Règle absolue :** Ne jamais committer ou modifier du code directement sur `main`.

## Branches

- **Format conventionnel :** `antigravity/<action-ou-description>` (en kebab-case)
- **Exemples :** `antigravity/update-aidd-memory`, `antigravity/fix-turnstile-token`

## Commits

- **Convention :** Conventional Commits (`type(scope): description`)
- **Types principaux :** `feat`, `fix`, `docs`, `refactor`, `chore`, `perf`
- **Scopes usuels :** `api`, `security`, `assets`, `seo`, `aidd`, `legal`
- **Langue des messages :** Français ou anglais selon la consigne, concis et intentionnel.

## Commit Strategy

- Découpage par étape cohérente après validation du typage (`pnpm run type-check`).
- Validation explicite requise avant tout merge vers `main` ou push distant.
