# Mémoire Architecture & Clean Code

## 1. Principes Directeurs
- **Séparation stricte des responsabilités (Clean Architecture) :** Le domaine métier pur ne dépend d'aucun framework ni service tiers.
- **NodeNext Resolution :** Imports stricts avec extension `.js` relative (`import { foo } from './bar.js'`) compatible ESM/CJS Vercel Serverless.
- **Typage Stricte TypeScript 7 :** Flags `noUncheckedIndexedAccess`, `noImplicitOverride`, `noFallthroughCasesInSwitch`, `useUnknownInCatchVariables`.

## 2. Cartographie des Couches

```text
src/
├── core/                           # Couche Domaine (Pure TypeScript, sans dépendance externe)
│   ├── types.ts                    # Contrats d'interfaces, types d'entrées/sorties
│   ├── errors.ts                   # Erreurs métier typées (ValidationError, SecurityError, etc.)
│   └── validation.ts               # Fonctions pures de validation email & honeypot
├── infrastructure/                 # Adaptateurs d'entrées/sorties & API externes
│   ├── config.ts                   # Configuration centralisée immuable (APP_CONFIG)
│   ├── security.provider.ts        # En-têtes CORS stricts & signatures cryptographiques HMAC
│   ├── turnstile.client.ts         # Adaptateur Cloudflare Turnstile Siteverify
│   └── resend.client.ts            # Client API Resend (audiences, contacts, envoi d'emails)
├── services/                       # Couche Application (Orchestration des flux métier)
│   ├── rate-limiter.service.ts     # Fenêtre glissante par IP et cooldown d'email
│   ├── subscription.service.ts     # Flux complet d'inscription à la liste d'attente
│   └── unsubscribe.service.ts      # Flux sécurisé de désinscription
└── templates/                      # Modèles transactionnels
    └── confirmation.template.ts    # Générateur dynamique HTML/texte avec HMAC dynamique

api/                                # Couche Présentation (Contrôleurs Serverless Vercel minces)
├── subscribe.ts                    # POST /api/subscribe
└── unsubscribe.ts                  # GET /api/unsubscribe

assets/                             # Couche Médias Statiques Optimisés
├── mascot.webp / mascot.png        # Mascotte 3D (96 Ko WebP / 705 Ko PNG)
├── logo.webp / logo.png            # Logo officiel (13 Ko WebP / 60 Ko PNG)
├── og-image.png                    # Carte Open Graph (1200×630)
└── favicon-*.png                   # Favicons multi-résolutions & Apple Touch Icon
```

## 3. Règle des Contrôleurs Légers (`api/`)
Les contrôleurs dans `api/` ne contiennent aucune logique métier :
- Extraire les paramètres de requête HTTP (`req.body`, `req.headers`, `req.query`).
- Déléguer l'exécution au service applicatif correspondant (`subscriptionService.subscribe`, `unsubscribeService.unsubscribe`).
- Mapper les erreurs typées du domaine vers les codes HTTP adéquats (`400`, `403`, `404`, `429`, `500`).
