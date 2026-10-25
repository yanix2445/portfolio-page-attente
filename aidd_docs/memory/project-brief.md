# Project Brief

Vision, intention produit et vocabulaire métier du projet **portfolio-page-attente** (`yanis-harrat.com`).

## What it is

Page d'attente officielle et formulaire de capture d'inscriptions pour le portfolio professionnel de Yanis Harrat (étudiant en BTS SIO SISR et futur administrateur systèmes, réseaux & cloud).

## Why it exists

- Créer une présence web immédiate, professionnelle et crédible sur le domaine racine `yanis-harrat.com`.
- Capturer les emails des recruteurs, professionnels de l'IT et pairs intéressés par l'ouverture du portfolio complet.
- Démontrer le sérieux technique et la maîtrise des standards de sécurité (HMAC, Turnstile invisible, CSP A+, RGPD) dès la page d'attente.

## Domain language

| Terme | Définition |
| :--- | :--- |
| **Waitlist** | Liste d'attente d'abonnés stockée dans l'Audience Resend. |
| **Turnstile** | Solution CAPTCHA invisible de Cloudflare vérifiant le comportement de navigation sans test interactif. |
| **Siteverify** | Échange serveur à serveur validant le jeton Turnstile émis par le navigateur. |
| **HMAC SHA-256** | Signature cryptographique scellée permettant la validation sans base de données du lien de désinscription. |
| **RFC 8058** | Standard technique d'en-tête email pour la désinscription en un clic (`List-Unsubscribe-Post`). |
| **Honeypot** | Champ de formulaire masqué destiné à piéger les bots d'indexation malveillants. |

## Key features

- Formulaire d'inscription instantané avec validation syntaxique RFC 5322.
- Envoi automatique d'un email de confirmation transactionnel avec template personnalisé scellé.
- Mécanisme de désinscription sécurisé en un clic via signature HMAC sans dépendance à une base de données d'état.
- Conformité RGPD et LCEN complète avec page dédiée [`mentions-legales.html`](../../mentions-legales.html).
- Optimisation maximale des actifs visuels (WebP -96% de poids) et en-têtes de sécurité renforcés.
