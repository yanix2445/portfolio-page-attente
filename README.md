# Yanis Harrat — Page d'Attente & Vitrine Technique

Espace de pré-lancement officiel et vitrine d'ingénierie de **Yanis Harrat**, étudiant en 1ère année de BTS SIO SISR (Solutions d'Infrastructure, Systèmes et Réseaux) à Paris, en recherche d'une alternance (rythme 3j entreprise / 2j école).

Accessible en production sur : **[https://www.yanis-harrat.com](https://www.yanis-harrat.com)**

---

## 🏗️ Architecture & Clean Code

Le projet est structuré selon les principes de la **Clean Architecture**, séparant strictement les règles métier, les adaptateurs d'infrastructure et les contrôleurs Serverless :

```text
portfolio-page-attente/
├── api/                                # Contrôleurs Serverless Vercel (minces et découplés)
│   ├── subscribe.ts                    # Point d'entrée POST /api/subscribe
│   └── unsubscribe.ts                  # Point d'entrée GET /api/unsubscribe (One-Click & Web)
├── assets/                             # Ressources multimédias optimisées
│   ├── mascot.webp / mascot.png        # Mascotte Hero (96 Ko WebP avec fallback PNG)
│   ├── logo.webp / logo.png            # Identité visuelle (13 Ko WebP avec fallback PNG)
│   ├── og-image.png                    # Carte Open Graph (1200×630)
│   └── favicon-*.png                   # Favicons standard et Apple Touch Icon
├── src/
│   ├── core/                           # Couche Domaine (Pure TypeScript, sans dépendance externe)
│   │   ├── types.ts                    # Contrats d'interfaces, entrées/sorties
│   │   ├── errors.ts                   # Erreurs typées (ValidationError, SecurityError, etc.)
│   │   └── validation.ts               # Fonctions pures de validation email & honeypot
│   ├── infrastructure/                 # Adaptateurs d'entrées/sorties et services externes
│   │   ├── config.ts                   # Configuration immuable typée (APP_CONFIG)
│   │   ├── security.provider.ts        # En-têtes CORS stricts & signatures HMAC SHA-256
│   │   ├── turnstile.client.ts         # Adaptateur de vérification Cloudflare Turnstile
│   │   └── resend.client.ts            # Client API Resend (audiences, contacts, emails)
│   ├── services/                       # Couche Application (Orchestration métier)
│   │   ├── rate-limiter.service.ts     # Fenêtre glissante par IP et cooldown d'email
│   │   ├── subscription.service.ts     # Flux complet d'inscription à la liste d'attente
│   │   └── unsubscribe.service.ts      # Flux sécurisé de désinscription
│   └── templates/                      # Modèles d'emails transactionnels
│       └── confirmation.template.ts    # Générateur HTML et texte brut avec HMAC dynamique
├── index.html                          # Interface utilisateur statique haute performance (32 Ko)
├── llms.txt                            # Fichier standard d'ingestion IA (Agent Readiness)
├── robots.txt                          # Directives de crawl et autorisations pour agents IA
├── sitemap.xml                         # Plan de site XML avec schéma d'images Google
├── tsconfig.json                       # Configuration stricte TypeScript 7 (NodeNext)
└── vercel.json                         # En-têtes de sécurité (CSP, HSTS), cache CDN & rewrites
```

---

## 🛡️ Sécurité & Résilience

Le backend et la couche réseau intègrent plusieurs niveaux de protection contre les abus, le spam et l'usurpation :

- **Cloudflare Turnstile (Invisible) :** Validation anti-bot côté serveur sur chaque soumission, bloquant l'automatisation sans friction utilisateur.
- **Signatures Cryptographiques HMAC SHA-256 :** Chaque lien de désinscription contient un jeton signé avec comparaison à temps constant (`crypto.timingSafeEqual`) pour empêcher la désinscription arbitraire de tiers.
- **En-têtes CORS Stricts :** Whitelist explicite des origines (`https://www.yanis-harrat.com` et environnements locaux autorisés).
- **Protection Anti-Spam Hybride :** Champ piège *honeypot* masqué + rate-limiter glissant en mémoire par adresse IP.
- **En-têtes HTTP Durcis (`vercel.json`) :**
  - `Content-Security-Policy` : restriction des scripts et frames aux domaines de confiance.
  - `Strict-Transport-Security` : `max-age=63072000; includeSubDomains; preload` (standard A+ SSL).
  - `Permissions-Policy` : neutralisation des APIs capteurs et du pistage (`browsing-topics`).
  - `Referrer-Policy: strict-origin-when-cross-origin`.

---

## ⚡ Performance & Core Web Vitals

- **Poids HTML allégé :** Le document [`index.html`](index.html) pèse **32 Ko** suite à l'extraction des médias inline en fichiers statiques.
- **Formats d'image modernes :** Mascotte et logo convertis en **WebP** (`<picture>` avec fallback PNG), réduisant le poids réseau de **3,4 Mo à ~110 Ko** (-96 % de bande passante).
- **Cache CDN Immuable :** En-tête `Cache-Control: public, max-age=31536000, immutable` appliqué à l'ensemble du dossier `/assets/*`.
- **Micro-interactions soignées :** Physique de ressorts Apple (`cubic-bezier`), toasts de confirmation HUD style Dynamic Island et ergonomie tactile calibrée (zones cibles de 44 px).

---

## 🤖 SEO, AI-SEO & Agent Readiness

Le site est optimisé pour les moteurs de recherche traditionnels et les moteurs d'intelligence artificielle :

- **Citations IA (AEO / GEO) :** [`robots.txt`](robots.txt) autorise explicitement les robots d'indexation conversationnels (`PerplexityBot`, `OAI-SearchBot`, `Claude-SearchBot`, `ChatGPT-User`, `Google-Extended`, `Applebot-Extended`).
- **Standard [`llms.txt`](llms.txt) :** Fichier structuré à la racine fournissant le contexte clé (identité, spécialité BTS SIO SISR, compétences homelab/réseau) directement ingérable par les LLMs sans parsing du DOM.
- **Image SEO :** [`sitemap.xml`](sitemap.xml) enrichi avec le schéma `xmlns:image` de Google pour un référencement multimodal précis.
- **Balisage sémantique :** Données structurées JSON-LD `@graph` (`WebSite`, `ProfilePage`, `Person`), balises Open Graph et Twitter Cards complètes.

---

## 🛠️ Stack Technique

| Composant | Technologie | Rôle |
| :--- | :--- | :--- |
| **Langage & Typage** | TypeScript 7 (ES2022 / NodeNext) | Typage ultra-strict (`noUncheckedIndexedAccess`, `strict: true`) |
| **Gestionnaire de paquets** | PNPM 12 | Gestion stricte des dépendances et scripts de build approuvés |
| **Hébergement & API** | Vercel Serverless Functions | Exécution des contrôleurs TypeScript légers |
| **Email Transactionnel** | Resend API | Gestion de l'audience de liste d'attente et délivrabilité des emails |
| **Sécurité Anti-Bot** | Cloudflare Turnstile | Challenge invisible sans CAPTCHA graphique |
| **Styles & Design** | Tailwind CSS v4 | Design tokens, mode sombre `#09090b`, typographies Sora, Geist & JetBrains Mono |
| **Supervision de Processus** | Portly | Gestion des processus de développement et tests locaux |

---

## 💻 Développement Local

### Prérequis
- [Node.js](https://nodejs.org/) (version 20 LTS ou supérieure recommandée)
- [pnpm](https://pnpm.io/) (`corepack enable pnpm`)

### Installation & Contrôles

```bash
# 1. Cloner le dépôt
git clone https://github.com/yanix2445/portfolio-page-attente.git
cd portfolio-page-attente

# 2. Installer les dépendances
pnpm install

# 3. Vérifier la conformité TypeScript
pnpm run type-check
```

### Variables d'Environnement

Créez un fichier `.env.local` pour exécuter les fonctions API en local :

```env
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_SEGMENT_ID=573be7ef-e507-4299-9de5-3ef2dc46917c
TURNSTILE_SECRET_KEY=0x4AAAAAA...
UNSUBSCRIBE_SECRET=votre-cle-secrete-hmac
```

---

## 📬 Contact & Liens Professionnels

- **Yanis Harrat** — Étudiant en BTS SIO SISR à Paris
- **Email direct :** [yanis@yanis-harrat.com](mailto:yanis@yanis-harrat.com)
- **LinkedIn :** [linkedin.com/in/yanis-harrat](https://www.linkedin.com/in/yanis-harrat/)
- **GitHub :** [github.com/yanix2445](https://github.com/yanix2445)
- **Portfolio :** [https://www.yanis-harrat.com](https://www.yanis-harrat.com)
