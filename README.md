# yanis-harrat.com · Page d'attente

Salut, moi c'est Yanis.

Plutôt que d'envoyer un énième CV PDF de deux pages avec une liste de technos abstraites que personne ne lit vraiment, j'ai codé ce site pour poser les bases de ce que je fais au quotidien. C'est la page d'attente de mon futur portfolio d'ingénierie : **[https://www.yanis-harrat.com](https://www.yanis-harrat.com)**.

Je suis en 1ère année de BTS SIO SISR à Paris (Aurlom). Mon truc, c'est l'administration systèmes, la virtualisation, le réseau Cisco et le scripting d'automatisation. 

Je cherche une alternance de 2 ans en administration systèmes et réseaux (rythme 3 jours en boîte / 2 jours en cours), disponible tout de suite sur Paris et l'Île-de-France.

---

## Pourquoi cette page d'attente existe

Je voulais une page propre pour trois raisons :

1. **Donner un point de contact direct** à ceux qui veulent suivre mes projets ou échanger sur une alternance, sans passer par un formulaire de contact austère.
2. **Proposer une vraie liste d'attente** : les gens laissent leur email, reçoivent une confirmation automatique et seront prévenus dès que mon homelab et mes documentations techniques seront en ligne.
3. **Prouver par le code** que même pour une bête page d'attente, je refuse de poser un template WordPress ou un Webflow de 15 Mo avec 80 scripts de tracking.

---

## Ce qui tourne chez moi (mon homelab & mes projets)

Cette page annonce un espace beaucoup plus complet où je documente mes machines physiques et mes réalisations :

* **Un cluster Proxmox VE physique :** Pas juste deux VMs jetables sur un cloud gratuit. J'ai deux machines dédiées chez moi (un serveur d'entreprise reconditionné et une station dédiée), sur lesquelles tournent mes conteneurs LXC et Docker pour mes services perso (n8n pour l'automatisation, Home Assistant, reverse proxy et supervision).
* **Du vrai réseau :** Des topologies Cisco segmentées avec VLANs, du routage OSPF, des pare-feux pfSense/Fortinet et des tunnels VPN configurés proprement.
* **De l'administration système :** Du Linux au quotidien (Debian, Ubuntu Server) et du Windows Server (Active Directory, GPO, DNS, DHCP), automatisés avec du Bash, du PowerShell et du Python.
* **Des bases solides et validées :** Google Cybersecurity, Google IT Support, Cisco Introduction to Cybersecurity, Anthropic Claude Platform.

---

## Comment c'est codé (Clean Architecture & TypeScript strict)

Même avec un périmètre restreint, j'ai voulu une architecture propre, découplée et typée en TypeScript 7 :

```text
portfolio-page-attente/
├── api/                            # Serverless functions Vercel (contrôleurs fins)
│   ├── subscribe.ts                # POST /api/subscribe (inscription)
│   └── unsubscribe.ts              # GET /api/unsubscribe (désinscription sécurisée)
├── assets/                         # Médias optimisés (WebP prioritaires + fallbacks PNG)
│   ├── mascot.webp / mascot.png    # Mascotte 3D (96 Ko WebP / 705 Ko PNG)
│   ├── logo.webp / logo.png        # Logo (13 Ko WebP / 60 Ko PNG)
│   ├── og-image.png                # Carte de partage pour LinkedIn et Twitter
│   └── favicon-*.png               # Favicons et icône Apple Touch
├── src/
│   ├── core/                       # Métier pur en TypeScript (zéro dépendance externe)
│   │   ├── types.ts                # Contrats d'interfaces et payloads
│   │   ├── errors.ts               # Classes d'erreurs HTTP typées (400, 403, 429)
│   │   └── validation.ts           # Validation d'email pure et détection honeypot
│   ├── infrastructure/             # Adaptateurs pour les services tiers
│   │   ├── config.ts               # Configuration et variables d'environnement
│   │   ├── security.provider.ts    # Signatures HMAC et filtrage CORS
│   │   ├── turnstile.client.ts     # Client de vérification Cloudflare Turnstile
│   │   └── resend.client.ts        # Client API Resend (gestion des audiences et envoi)
│   ├── services/                   # Logique applicative
│   │   ├── rate-limiter.service.ts # Fenêtre glissante par IP contre les abus
│   │   ├── subscription.service.ts # Orchestration complète d'une inscription
│   │   └── unsubscribe.service.ts  # Vérification du HMAC et désactivation du contact
│   └── templates/
│       └── confirmation.template.ts # Générateur d'email dynamique avec HMAC scellé
├── index.html                      # Interface HTML5 sémantique (32 Ko au total)
├── llms.txt                        # Contexte machine lisible pour les assistants IA
├── robots.txt                      # Règles de crawl moteurs & agents IA
├── sitemap.xml                     # Plan de site XML avec schéma d'images Google
├── tsconfig.json                   # Configuration TypeScript stricte (NodeNext)
└── vercel.json                     # En-têtes de sécurité, rewrites et cache CDN
```

---

## La sécurité (du concret, pas des buzzwords)

Dès qu'on met un formulaire public sur Internet, les bots arrivent en quelques minutes. Voici comment l'API est blindée :

- **Cloudflare Turnstile en mode invisible :** Chaque soumission doit fournir un jeton validé côté serveur. Résultat : zéro bot, zéro email bombing, et l'utilisateur n'a aucun captcha visuel pénible à résoudre.
- **Signatures HMAC SHA-256 pour la désinscription :** Le lien de désinscription envoyé par email est signé avec un secret serveur (`crypto.timingSafeEqual`). Personne ne peut désinscrire un tiers en devinant simplement son adresse email dans l'URL.
- **CORS verrouillé :** Seul `https://www.yanis-harrat.com` (et mes ports locaux de test) peuvent appeler l'API.
- **Honeypot masqué + Rate Limiter en mémoire :** Un faux champ attire les robots basiques, et les requêtes par IP sont limitées dans le temps.
- **En-têtes HTTP stricts dans `vercel.json` :** CSP personnalisée, HSTS sur 2 ans avec preload, `Referrer-Policy: strict-origin-when-cross-origin` et blocage des capteurs via `Permissions-Policy`.

---

## Les chiffres & la performance

- **32 Ko de HTML pur** : J'ai sorti l'ancienne image en base64 de 2,7 Mo pour la servir en fichier statique externe. La page charge instantanément même sur une mauvaise 4G.
- **WebP moderne** : La mascotte est passée de 2 Mo à **96 Ko**, le logo pèse **13 Ko**, avec des fallbacks PNG automatiques pour les vieux navigateurs.
- **Cache CDN immuable** : Le dossier `/assets/*` est mis en cache pour un an (`max-age=31536000, immutable`).
- **Touch feel inspiré d'Apple** : Physique de ressort CSS (`cubic-bezier`), bouton de copie d'email avec toast dynamique en haut de l'écran, et cibles tactiles de 44 px minimum sur mobile.

---

## Tester en local

```bash
# Cloner et installer les dépendances
git clone https://github.com/yanix2445/portfolio-page-attente.git
cd portfolio-page-attente
pnpm install

# Contrôle du typage strict TypeScript
pnpm run type-check
```

Pour faire tourner les Serverless Functions en local, il suffit d'ajouter un `.env.local` :

```env
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_SEGMENT_ID=573be7ef-e507-4299-9de5-3ef2dc46917c
TURNSTILE_SECRET_KEY=0x4AAAAAA...
UNSUBSCRIBE_SECRET=votre-cle-secrete-locale
```

---

## On discute ?

Je suis disponible immédiatement pour échanger autour d'une alternance en administration systèmes et réseaux :

* **Email direct :** [yanis@yanis-harrat.com](mailto:yanis@yanis-harrat.com)
* **LinkedIn :** [linkedin.com/in/yanis-harrat](https://www.linkedin.com/in/yanis-harrat/)
* **GitHub :** [github.com/yanix2445](https://github.com/yanix2445)
* **Site en direct :** [yanis-harrat.com](https://www.yanis-harrat.com)
