# AGENTS.md — Configuration Agent & Mémoire Projet (portfolio-page-attente)

Configuration locale des agents d'ingénierie IA (Antigravity, Codex, Claude Code) pour le projet **portfolio-page-attente** (`yanis-harrat.com`), conforme aux standards AIDD.

---

## Profil Utilisateur & Engagement

- **Identité :** Yanis Harrat
- **Contact direct :** `yanis@yanis-harrat.com`
- **Track technique :** 1ère année BTS SIO SISR (Aurlom Paris) · Recherche d'alternance 3j entreprise / 2j école.
- **Style de travail :** Authentique, direct, chill, pro, rigoureux, sans prétention corporative.
- **Règle d'or :** Zéro blabla, zéro complaisance, efficacité maximale par mot, solutions simples et stables.

---

## Règles Opérationnelles du Projet

### 1. Sécurité des fichiers (`trash`)
- **Interdiction absolue de `rm` :** Ne jamais exécuter `rm`, `rm -rf`, ou toute variante destructive.
- **Usage exclusif de `trash` :** Toujours utiliser `trash <chemin>` pour placer les fichiers dans la corbeille macOS.

### 2. Gestion des branches Git
- **Interdiction de committer directement sur `main` :** Toujours créer une branche de travail dédiée `antigravity/<action>` avant toute modification.
- **Validation avant fusion :** Contrôle systématique du typage TypeScript avec `pnpm run type-check` avant merge et push.

### 3. Gestion des processus & dev server (Portly)
- Toujours utiliser **Portly** (`portly ...`) pour lancer, inspecter ou superviser les serveurs locaux ou tâches temporaires. Ne jamais lancer de serveurs détachés en arrière-plan non supervisés.

---

## Mémoire Projet AIDD (`aidd_docs/`)

La mémoire vivante, les décisions d'architecture et les spécifications techniques résident dans [`aidd_docs/`](aidd_docs/).

<!-- aidd_project_memory:start -->
- **Index de la mémoire :** [`aidd_docs/memory/README.md`](aidd_docs/memory/README.md)
- **Clean Architecture :** [`aidd_docs/memory/architecture.md`](aidd_docs/memory/architecture.md)
- **Sécurité & Défense en profondeur :** [`aidd_docs/memory/security.md`](aidd_docs/memory/security.md)
- **Registre des décisions (ADR) :** [`aidd_docs/memory/decisions.md`](aidd_docs/memory/decisions.md)
- **Contexte & Historique de la session :** [`aidd_docs/memory/session-context.md`](aidd_docs/memory/session-context.md)
<!-- aidd_project_memory:end -->

---

## Stack & Commandes Essentielles

- **Langage :** TypeScript 7.0 (Mode `NodeNext` strict)
- **Gestionnaire :** PNPM 12
- **Plateforme :** Vercel Serverless Functions + Frontend HTML/CSS
- **Sécurité :** Cloudflare Turnstile invisible + HMAC SHA-256 (`timingSafeEqual`)
- **Emailing :** Resend API (Audiences, Confirmation immédiate, RFC 8058)

```bash
# Vérification du typage
pnpm run type-check
```
