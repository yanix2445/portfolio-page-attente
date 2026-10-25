# Page d'attente · Yanis Harrat

La page d'attente officielle de mon futur portfolio technique : **[yanis-harrat.com](https://www.yanis-harrat.com)**.

Je suis en 1ère année de BTS SIO SISR à Paris (Aurlom). Plutôt que de balancer un énième CV PDF standardisé avec une liste de technos abstraites, j'ai mis en place cette page pour préparer le terrain et montrer du concret : ce que je fais sur mon homelab physique, mes configs réseau, mes scripts d'automatisation et ma façon de coder.

Je cherche une alternance de 2 ans en administration systèmes et réseaux (rythme 3 jours en entreprise / 2 jours en cours), disponible immédiatement sur Paris et l'Île-de-France.

---

## Ce que fait cette page

C'est un point de contact rapide et une liste d'attente pour ceux qui veulent suivre la sortie du portfolio complet (recruteurs, tuteurs, collègues) :

- Un formulaire d'inscription direct branché sur l'API Resend.
- Un email de confirmation immédiat envoyé à l'inscrit, avec un lien de désinscription sécurisé en 1 clic.
- Une interface sans framework lourd, ultra-rapide (32 Ko de HTML brut).
- Une sécurité invisible côté serveur pour bloquer le spam sans embêter l'utilisateur avec des captchas graphiques.

---

## Ce qui tourne derrière (mon infra & mes projets)

Cette page annonce un espace plus complet où je documente mes projets réels :

- **Homelab physique sous Proxmox VE :** 2 serveurs physiques dédiés chez moi, pas juste des VMs jetables sur le cloud. Un cluster de virtualisation, des conteneurs LXC et Docker pour mes services perso (n8n, supervision, Home Assistant, reverse proxy).
- **Réseau & Sécurité :** Topologies Cisco segmentées avec VLANs, routage OSPF, pare-feu pfSense/Fortinet, accès VPN sécurisés.
- **Systèmes & Scripting :** Déploiement et gestion Linux (Debian, Ubuntu Server) et Windows Server (Active Directory, GPO, DNS, DHCP), scripts d'automatisation en Bash, PowerShell et Python.
- **Certifications validées :** Google Cybersecurity, Google IT Support, Cisco Introduction to Cybersecurity, Anthropic Claude Platform.

---

## Architecture logicielle & Clean Code

Même pour une simple page d'attente, j'ai voulu une base de code propre, typée et maintenable, sans tout mélanger dans un fichier unique :

```text
portfolio-page-attente/
├── api/                            # Serverless functions Vercel (contrôleurs minces)
│   ├── subscribe.ts                # POST /api/subscribe (inscription)
│   └── unsubscribe.ts              # GET /api/unsubscribe (désinscription)
├── assets/                         # Images compressées et formats modernes
│   ├── mascot.webp / mascot.png    # Mascotte Hero (96 Ko WebP / fallback PNG)
│   ├── logo.webp / logo.png        # Logo (13 Ko WebP / fallback PNG)
│   ├── og-image.png                # Carte de partage social (1200×630)
│   └── favicon-*.png               # Favicons multi-résolutions
├── src/
│   ├── core/                       # Domaine pur TypeScript (zéro dépendance)
│   │   ├── types.ts                # Contrats d'interfaces et types stricts
│   │   ├── errors.ts               # Classes d'erreurs typées (400, 403, 429)
│   │   └── validation.ts           # Validation pure de l'email et honeypot
│   ├── infrastructure/             # Adaptateurs pour les services externes
│   │   ├── config.ts               # Variables d'environnement typées
│   │   ├── security.provider.ts    # Signatures HMAC et gestion des origines CORS
│   │   ├── turnstile.client.ts     # Vérification API Cloudflare Turnstile
│   │   └── resend.client.ts        # Appels API Resend (audiences et envoi)
│   ├── services/                   # Logique applicative
│   │   ├── rate-limiter.service.ts # Fenêtre glissante par IP pour éviter le spam
│   │   ├── subscription.service.ts # Orchestration complète d'une inscription
│   │   └── unsubscribe.service.ts  # Validation HMAC et désactivation du contact
│   └── templates/
│       └── confirmation.template.ts # Génération du template email avec HMAC
├── index.html                      # Page HTML5 sémantique et réactive (32 Ko)
├── llms.txt                        # Fichier de contexte pour les assistants IA
├── robots.txt                      # Règles de crawl (moteurs de recherche et bots IA)
├── sitemap.xml                     # Plan de site XML avec métadonnées images
├── tsconfig.json                   # TypeScript 7 en mode strict NodeNext
└── vercel.json                     # Headers de sécurité, cache CDN et rewrites
```

---

## Sécurité concrète (sans blabla)

- **Cloudflare Turnstile (mode invisible) :** Chaque formulaire validé passe par une vérification de jeton côté serveur. Résultat : zéro bot, zéro email bombing, et l'utilisateur n'a rien à cocher.
- **Signatures HMAC SHA-256 :** Pour la désinscription, le lien envoyé par email contient un token cryptographique (`crypto.timingSafeEqual`). Impossible pour un tiers de forcer la désinscription de quelqu'un d'autre en devinant son adresse.
- **CORS strict :** Seuls mon domaine en production (`https://www.yanis-harrat.com`) et mes environnements de dev locaux sont autorisés à requêter l'API.
- **Honeypot + Rate Limiter :** Un faux champ caché piège les scrapers basiques, couplé à une limite de requêtes par IP en mémoire.
- **Headers HTTP renforcés (`vercel.json`) :**
  - `Content-Security-Policy` pour restreindre strictement les scripts et styles autorisés.
  - `Strict-Transport-Security` (HSTS) avec preload sur 2 ans.
  - `Permissions-Policy` désactivant les capteurs (micro, caméra, géolocalisation).
  - `Referrer-Policy: strict-origin-when-cross-origin`.

---

## Performance & rendu

- **Poids plume :** 32 Ko de HTML pour la page complète (au lieu de 2,75 Mo au début quand l'image était en base64 dans le code).
- **WebP en priorité :** La mascotte pèse **96 Ko** et le logo **13 Ko**, servis via des balises `<picture>` avec fallbacks PNG pour les anciens navigateurs.
- **Cache CDN immuable :** Les fichiers sous `/assets/*` sont servis avec `Cache-Control: public, max-age=31536000, immutable`.
- **Sensations Apple :** Animations fluides en CSS pur (`cubic-bezier`), bouton de copie de mail instantané avec toast dynamique en haut de l'écran, et zones tactiles calibrées à 44 px minimum sur mobile.

---

## Lancer le projet en local

### Prérequis
- Node.js (version 20 ou plus récente)
- pnpm (`corepack enable pnpm`)

### Installation

```bash
git clone https://github.com/yanix2445/portfolio-page-attente.git
cd portfolio-page-attente

pnpm install
pnpm run type-check
```

### Variables d'environnement

Créer un fichier `.env.local` à la racine :

```env
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_SEGMENT_ID=573be7ef-e507-4299-9de5-3ef2dc46917c
TURNSTILE_SECRET_KEY=0x4AAAAAA...
UNSUBSCRIBE_SECRET=cle-secrete-hmac-locale
```

---

## Me contacter

Je suis dispo dès maintenant pour échanger sur une opportunité d'alternance ou des projets d'infrastructure :

- **Email :** [yanis@yanis-harrat.com](mailto:yanis@yanis-harrat.com)
- **LinkedIn :** [linkedin.com/in/yanis-harrat](https://www.linkedin.com/in/yanis-harrat/)
- **GitHub :** [github.com/yanix2445](https://github.com/yanix2445)
- **Site :** [yanis-harrat.com](https://www.yanis-harrat.com)
