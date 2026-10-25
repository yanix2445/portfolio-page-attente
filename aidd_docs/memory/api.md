# API

Surface d'exposition HTTP, contrats et points de terminaison de l'API Serverless.

## Style

- **Type :** REST JSON léger sur Vercel Serverless Functions (`@vercel/node`).
- **Préfixe des routes :** `/api/*`
- **En-têtes standards :** `Content-Type: application/json`, CORS restreint à `yanis-harrat.com` et `www.yanis-harrat.com`.

## Endpoints

### 1. Inscription à la liste d'attente
- **Route :** `POST /api/subscribe`
- **Sécurité :** Vérification Turnstile invisible (`cf-turnstile-response`), honeypot, validation d'email RFC 5322, rate limiting IP.
- **Corps de la requête :**
  ```json
  {
    "email": "visiteur@example.com",
    "turnstileToken": "0.xxxxxx...",
    "hp_field": ""
  }
  ```
- **Réponse succès (200 OK) :**
  ```json
  {
    "success": true,
    "message": "Inscription validée avec succès"
  }
  ```
- **Réponse erreur (400 / 403 / 429) :**
  ```json
  {
    "success": false,
    "error": "Message explicatif de l'erreur"
  }
  ```

### 2. Désinscription sécurisée
- **Route :** `GET /api/unsubscribe?email=...&sig=...`
- **Sécurité :** Signature HMAC SHA-256 scellée avec le secret serveur et validée via `crypto.timingSafeEqual` (résistance aux timing attacks).
- **Paramètres d'URL :**
  - `email` : adresse email de l'abonné
  - `sig` : signature hexadécimale générée à l'envoi de l'email
- **Réponse succès (200 OK) :** Redirection ou page HTML confirmant le retrait immédiat de l'audience Resend.
