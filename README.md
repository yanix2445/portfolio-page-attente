# Yanis Harrat — Vitrine d'Ingénierie & Page d'Attente

> **Portfolio technique et point d'entrée officiel vers mon homelab physique, mes architectures réseaux et mes réalisations en administration systèmes.**

[![Production](https://img.shields.io/badge/Production-www.yanis--harrat.com-orange?style=flat-square&logo=vercel)](https://www.yanis-harrat.com)
[![Status](https://img.shields.io/badge/Statut-Disponible_en_Alternance_(3j/2j)-emerald?style=flat-square)](mailto:yanis@yanis-harrat.com)
[![BTS SIO SISR](https://img.shields.io/badge/Formation-BTS_SIO_SISR_Aurlom_Paris-blue?style=flat-square)](https://www.aurlom.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0_(Strict_NodeNext)-3178C6?style=flat-square&logo=typescript)](tsconfig.json)
[![Sécurité](https://img.shields.io/badge/Sécurité-Turnstile_+_HMAC_SHA--256-green?style=flat-square)](vercel.json)

**[👉 Consulter la vitrine en ligne (yanis-harrat.com)](https://www.yanis-harrat.com)** · **[Me contacter directement](mailto:yanis@yanis-harrat.com)** · **[Profil LinkedIn](https://www.linkedin.com/in/yanis-harrat/)**

---

## 🎯 Proposition de Valeur & Contexte

### Le problème constaté
Les recruteurs et DSI reçoivent des dizaines de CVs d'étudiants standardisés, où il est impossible de distinguer un profil passif d'un candidat capable d'intervenir sur des environnements de production réels.

### La solution : Démontrer par la preuve
Plutôt qu'un simple document statique, ce projet est la **porte d'entrée technique** vers l'ensemble de mes réalisations pratiques. Il combine une page d'attente à haute performance pour capturer les premiers visiteurs (recruteurs, DSI, pairs) et un socle d'ingénierie moderne démontrant ma double compétence :
1. **La rigueur des infrastructures (SISR) :** Homelab physique, virtualisation Proxmox, routage Cisco, automatisation et maintien en condition opérationnelle (MCO).
2. **La rigueur du code moderne :** Clean Architecture, typage strict TypeScript, sécurité défensive en profondeur et performance Web standard.

---

## 🖥️ Preuves Opérationnelles & Homelab

Toutes les compétences mises en avant sont appuyées par une infrastructure matérielle active :

- **Cluster de Virtualisation Physique :** 2 serveurs physiques dédiés sous **Proxmox VE** (1 serveur dédié virtualisation d'entreprise + 1 station de lab dédiée).
- **Stack Conteneurs & Services :** Déploiements **Docker** et conteneurs LXC en environnement de test (automatisation n8n, supervision, reverse proxy sécurisé, Home Assistant).
- **Réseau & Sécurité :** Topologies réseaux segmentées (VLANs, routage OSPF, pare-feu pfSense/Fortinet, VPN sécurisés).
- **Certifications Validées :**
  - *Google IT Support Professional Certificate*
  - *Google Cybersecurity Certificate*
  - *Cisco Introduction to Cybersecurity*
  - *Anthropic Claude Platform & Architecture Certifications*

---

## 🏗️ Architecture Logicielle (Clean Code)

Le code backend respecte strictement la **Clean Architecture**, isolant le domaine métier de toute dépendance tierce :

```text
portfolio-page-attente/
├── api/                                # Contrôleurs Serverless Vercel (couche présentation mince)
│   ├── subscribe.ts                    # Point d'entrée POST /api/subscribe
│   └── unsubscribe.ts                  # Point d'entrée GET /api/unsubscribe (Web & One-Click RFC 8058)
├── assets/                             # Médias statiques ultra-optimisés
│   ├── mascot.webp / mascot.png        # Mascotte Hero (96 Ko WebP / 705 Ko PNG)
│   ├── logo.webp / logo.png            # Identité de marque (13 Ko WebP / 60 Ko PNG)
│   ├── og-image.png                    # Vignette de partage Open Graph (1200×630)
│   └── favicon-*.png                   # Favicons multi-résolutions & Apple Touch Icon
├── src/
│   ├── core/                           # Couche Domaine (Pure TypeScript, 0 dépendance)
│   │   ├── types.ts                    # Contrats d'interfaces et payloads immuables
│   │   ├── errors.ts                   # Erreurs typées du domaine (ValidationError, SecurityError, etc.)
│   │   └── validation.ts               # Fonctions pures de validation email & détection honeypot
│   ├── infrastructure/                 # Adaptateurs d'infrastructure (services externes)
│   │   ├── config.ts                   # Configuration globale immuable typée (APP_CONFIG)
│   │   ├── security.provider.ts        # En-têtes CORS stricts & signatures cryptographiques HMAC
│   │   ├── turnstile.client.ts         # Client de validation Cloudflare Turnstile
│   │   └── resend.client.ts            # Client API Resend (audiences, contacts, envoi d'emails)
│   ├── services/                       # Couche Application (Orchestration métier)
│   │   ├── rate-limiter.service.ts     # Limitation glissante par IP et cooldown d'email
│   │   ├── subscription.service.ts     # Workflow complet de souscription & notification
│   │   └── unsubscribe.service.ts      # Workflow de désinscription vérifié par HMAC
│   └── templates/                      # Modèles transactionnels
│       └── confirmation.template.ts    # Générateur HTML / texte brut avec signatures dynamiques
├── index.html                          # Interface utilisateur haute performance (32 Ko)
├── llms.txt                            # Ingestion machine-readable pour agents IA (Agent Readiness)
├── robots.txt                          # Directives de crawl & autorisations explicites des bots IA
├── sitemap.xml                         # Plan de site XML avec schéma d'images Google
├── tsconfig.json                       # Compilation TypeScript ultra-stricte (NodeNext)
└── vercel.json                         # En-têtes de sécurité (CSP, HSTS, Permissions), rewrites & cache CDN
```

---

## 🛡️ Sécurité & Résilience

L'application applique une stratégie de **défense en profondeur** pour protéger l'API et la messagerie contre le spam, les injections et les attaques automatisées :

| Mécanisme | Rôle & Implémentation |
| :--- | :--- |
| **Cloudflare Turnstile** | Validation invisible anti-bot côté serveur sur chaque souscription (zéro friction UX, élimination du spam automatisé). |
| **Signatures HMAC SHA-256** | Chaque lien de désinscription est scellé cryptographiquement avec vérification à temps constant (`crypto.timingSafeEqual`). |
| **En-têtes CORS Stricts** | Whitelist stricte limitant les requêtes à `https://www.yanis-harrat.com` et aux ports locaux de développement. |
| **Filtre Honeypot & Rate-Limiter** | Champ masqué anti-crawler + fenêtre glissante en mémoire par IP pour prévenir l'email bombing. |
| **Content Security Policy (CSP)** | Restriction stricte des sources de scripts, styles et frames autorisées (`'self'`, Cloudflare, Google Fonts). |
| **HSTS A+ & Confidentialité** | `Strict-Transport-Security: max-age=63072000; preload` + `Referrer-Policy: strict-origin-when-cross-origin`. |

---

## ⚡ Performance & Core Web Vitals (CRO)

L'expérience utilisateur est conçue pour maximiser le taux de conversion et supprimer toute friction :

- **Poids réseau minimal :** Document HTML allégé à **32 Ko** (contre 2,75 Mo à l'origine).
- **Images WebP modernes :** Découpage et compression avancée (mascotte à **96 Ko**, logo à **13 Ko**), offrant un gain de **-96 %** de bande passante sans compromis visuel.
- **Cache CDN Immuable :** `Cache-Control: public, max-age=31536000, immutable` appliqué aux assets statiques pour un chargement instantané lors des visites récurrentes.
- **Ergonomie tactile Apple HIG :** Zones tactiles d'au moins 44 px, micro-interactions calibrées avec courbes de ressort Apple (`cubic-bezier`), et toasts HUD Dynamic Island avec retour haptique.
- **Micro-réassurance de conversion :** Mention explicite anti-friction sous le formulaire : `[✓] Accès prioritaire · Zéro spam · Désinscription en 1 clic`.

---

## 🤖 SEO, AI-SEO & Agent Readiness

Optimisation complète pour les moteurs de recherche traditionnels et les moteurs d'intelligence artificielle (AEO / GEO) :

- **Découverte pour les LLMs ([`llms.txt`](llms.txt)) :** Résumé structuré au format standardisé pour permettre à ChatGPT, Perplexity et Claude de citer fidèlement le profil et les compétences.
- **Directives IA dans [`robots.txt`](robots.txt) :** Autorisation explicite des crawlers de recherche (`PerplexityBot`, `OAI-SearchBot`, `Claude-SearchBot`, `ChatGPT-User`, `Google-Extended`, `Applebot-Extended`) tout en bloquant l'indexation des endpoints backend `/api/`.
- **Image SEO ([`sitemap.xml`](sitemap.xml)) :** Intégration du schéma Google Images (`xmlns:image`) pour indexer la carte Open Graph et la mascotte 3D.
- **Données structurées Schema.org :** Schémas complets `@graph` (`WebSite`, `ProfilePage`, `Person` avec `knowsAbout`, `alumniOf`, `seeks`).

---

## 🛠️ Stack Technique

```text
Language & Runtime  : TypeScript 7.0.2 / Node.js 22 (Target ES2022, Module NodeNext)
Package Manager     : PNPM 12 (avec validation stricte des builds esbuild)
Serverless Platform : Vercel Serverless Functions
Email Delivery      : Resend API (Audiences, Tags, List-Unsubscribe RFC 8058)
Anti-Bot Security   : Cloudflare Turnstile (mode invisible)
Design & Styles     : Tailwind CSS v4, typographies Sora, Geist & JetBrains Mono
Process Supervision : Portly CLI & Supervisor
```

---

## 🚀 Prise en Main & Développement Local

### Prérequis
- [Node.js](https://nodejs.org/) (version 20+ recommandée)
- [pnpm](https://pnpm.io/) (`npm install -g pnpm` ou `corepack enable pnpm`)

### Démarrage rapide

```bash
# 1. Cloner le projet
git clone https://github.com/yanix2445/portfolio-page-attente.git
cd portfolio-page-attente

# 2. Installer les dépendances
pnpm install

# 3. Vérifier le typage TypeScript strict
pnpm run type-check
```

### Configuration des variables d'environnement

Créer un fichier `.env.local` à la racine :

```env
# Clé API Resend et Segment d'audience
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_SEGMENT_ID=573be7ef-e507-4299-9de5-3ef2dc46917c

# Clé secrète Cloudflare Turnstile
TURNSTILE_SECRET_KEY=0x4AAAAAA...

# Clé secrète de signature HMAC des désinscriptions
UNSUBSCRIBE_SECRET=votre-cle-secrete-hmac
```

---

## 📬 Contact & Recrutement

Disponible immédiatement pour une **alternance de 2 ans en BTS SIO SISR** sur Paris et toute l'Île-de-France (rythme : 3 jours en entreprise / 2 jours à l'école Aurlom Paris).

- **Yanis Harrat**
- **Email :** [yanis@yanis-harrat.com](mailto:yanis@yanis-harrat.com)
- **LinkedIn :** [linkedin.com/in/yanis-harrat](https://www.linkedin.com/in/yanis-harrat/)
- **GitHub :** [github.com/yanix2445](https://github.com/yanix2445)
- **Vitrine officielle :** [https://www.yanis-harrat.com](https://www.yanis-harrat.com)
