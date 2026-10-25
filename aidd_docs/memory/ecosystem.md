# Ecosystem

Cartographie des outils externes, plateformes cloud et flux d'intégration.

```mermaid
flowchart LR
  Human([Yanis / Humain])
  Agent([Agent IA])
  App([portfolio-page-attente])
  GitHub[\"GitHub · vcs.md\"\]
  Vercel[\"Vercel · deployment.md\"\]
  Resend[\"Resend API · api.md\"\]
  Cloudflare[\"Cloudflare Turnstile · security.md\"\]

  Human -- web/git --> GitHub
  Agent -- git cli --> GitHub
  Agent -- portly --> App

  GitHub -- trigger webhook --> Vercel
  App -- deploy --> Vercel
  App -- http/siteverify --> Cloudflare
  App -- https/api --> Resend
```

## External Tools & Services

- **GitHub :** Hébergement du code source et déclencheur des déploiements Vercel via intégration webhook native.
- **Vercel :** Hébergement de la page web, CDN mondial et exécution des fonctions serverless Node.js.
- **Resend :** Service d'envoi d'emails transactionnels et gestion de l'audience d'abonnés (`yanis-harrat.com`).
- **Cloudflare :** Protection bot Turnstile invisible via widget frontend et validation serveur Siteverify.
- **Portly :** Superviseur macOS de processus locaux pour le contrôle et l'isolation des serveurs de développement.
