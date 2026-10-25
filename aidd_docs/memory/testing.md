# Testing

Stratégie de test, vérification et assurance qualité sur **portfolio-page-attente**.

## Strategy

- **Contrôle statique :** Typage strict `tsc --noEmit` garantissant l'intégrité des contrats de données et des interfaces de services.
- **Tests fonctionnels & d'intégration :** Requêtes manuelles ou cURL sur les endpoints serverless avec variables de test locales.
- **Vérification navigateur & responsive :** Inspection visuelle sur navigateurs récents (Chrome, Safari, Firefox, Mobile iOS/Android) pour le rendu fluide du dark theme et des polices.

## Tools

- `typescript` (via `pnpm run type-check`) : compilateur et moteur d'assertions de types.
- Vercel CLI / Portly : environnement d'exécution local des fonctions serverless.

## Conventions

- Tout nouveau service ou adaptateur d'infrastructure doit déclarer son interface TypeScript dans `src/core/`.
- Aucun test ne doit appeler l'API de production Resend avec de véritables emails d'utilisateurs.

## Browser QA

- **URL locale :** Dépend du port attribué par le serveur de dev supervisé sous Portly (`portly status`).
- **Comportement attendu :**
  - Affichage instantané du logo, de la mascotte WebP et du formulaire.
  - Champ honeypot invisible pour les utilisateurs légitimes.
  - Soumission du formulaire déclenchant la pastille Cloudflare Turnstile invisible sans popup de défi.
  - Réponse JSON structurée (`success: true`) et affichage d'un message de confirmation à l'écran.
