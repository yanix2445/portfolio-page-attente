# Coding Assertions

Points de contrôle et portes de vérification indispensables pour assurer l'intégrité du code.

## Before commit

Porte de validation rapide exécutée localement avant tout commit :

| Ordre | Commande | Vérification |
| :--- | :--- | :--- |
| 1 | `pnpm run type-check` | Vérification de typage strict TypeScript (`tsc --noEmit`) |

## Before push

Porte de validation complète avant publication sur le dépôt distant :

| Ordre | Commande | Vérification |
| :--- | :--- | :--- |
| 1 | `pnpm run type-check` | Cohérence TypeScript totale sans warning ni erreur |
| 2 | `git status` | Vérification qu'aucun fichier temporaire ou artefact inutile n'est staged |

## Behavior

- En cas d'erreur lors du `type-check`, l'agent doit résoudre les erreurs localement avant de solliciter l'utilisateur.
- Ne jamais désactiver le mode strict ou introduire de cast `as any` pour contourner un défaut de typage.
