# Deployment

Infrastructure d'hébergement, pipeline de déploiement continu et en-têtes de sécurité réseau.

## Plateforme & Hébergement

- **Fournisseur :** Vercel
- **Région :** Washington D.C. (iad1) / CDN distribué Edge
- **Domaines configurés :** `yanis-harrat.com` (Apex) et `www.yanis-harrat.com`

## Pipeline CI/CD

- Déploiement automatique déclenché par GitHub sur merge de la branche `main`.
- Les branches temporaires `antigravity/*` bénéficient de déploiements de prévisualisation (Preview Deployments) isolés si un PR est ouvert.

## Configuration Vercel (`vercel.json`)

- **En-têtes HTTP de sécurité globaux :**
  - `Content-Security-Policy` : restriction des scripts autorisés (inline scellé, Cloudflare Turnstile `challenges.cloudflare.com`).
  - `Strict-Transport-Security` : `max-age=63072000; includeSubDomains; preload` (Note A+ HSTS).
  - `X-Content-Type-Options` : `nosniff`.
  - `X-Frame-Options` : `DENY`.
  - `Referrer-Policy` : `strict-origin-when-cross-origin`.
  - `Permissions-Policy` : désactivation de la géolocalisation, caméra, microphone.
- **Règles de réécriture & cache :**
  - Cache statique long terme (`Cache-Control: public, max-age=31536000, immutable`) pour les assets WebP dans `/assets/`.
  - Pas de cache sur les routes Serverless `/api/*`.
