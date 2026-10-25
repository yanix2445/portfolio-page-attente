# Forms

Gestion des formulaires, validation et états de soumission sur l'interface.

## Approach

- **Validation cliente :** JavaScript vanilla asynchrone (`fetch`) avec gestion dynamique des états (`idle`, `loading`, `success`, `error`).
- **Validation serveur :** TypeScript strict dans `api/subscribe.ts` avec regex RFC 5322 pour l'email.

## Protection Anti-Abus & Bot

1. **Honeypot :** Champ d'entrée masqué en CSS (`tabindex="-1"`, invisible pour un humain). Tout champ renseigné entraîne un rejet immédiat silencieux.
2. **Cloudflare Turnstile :** Widget invisible générant un jeton `cf-turnstile-response` lors de l'interaction avec le formulaire.
3. **Limiteur de fréquence :** Protection mémoire IP pour bloquer les tentatives de spam répétées sur le même client.

## États du Formulaire

- **Initial :** Champ email réceptif avec placeholder sobre.
- **Soumission en cours :** Bouton désactivé (`disabled`), indicateur de chargement visuel.
- **Succès :** Disparition du formulaire au profit d'un message de confirmation invitant à consulter sa boîte mail.
- **Erreur :** Message d'erreur explicite sous le champ sans rechargement de page.
