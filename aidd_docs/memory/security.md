# Spécifications de Sécurité & Défense en Profondeur

## 1. Cloudflare Turnstile (Invisible)
- **Objectif :** Bloquer 100 % du spam et de l'automatisation sans captcha graphique (pas de feux rouges ni passages piétons).
- **Fonctionnement :**
  - Widget invisible monté sur `#turnstile-container` avec `sitekey: 0x4AAAAAAFkzHtilHfutyChR`.
  - Lors de la soumission du formulaire, `turnstile.getResponse()` extrait le jeton éphémère.
  - Le serveur valide le jeton auprès de `https://challenges.cloudflare.com/turnstile/v0/siteverify` avec `TURNSTILE_SECRET_KEY`.
  - Absence ou invalidité du jeton = Rejet immédiat avec `HTTP 403`.

## 2. Signatures Cryptographiques HMAC SHA-256 (Désinscription)
- **Objectif :** Empêcher la désinscription arbitraire de tiers par simple connaissance de leur adresse email.
- **Fonctionnement :**
  - Signature générée lors de l'envoi de l'email : `crypto.createHmac('sha256', SECRET).update(email).digest('hex')`.
  - Vérification à temps constant via `crypto.timingSafeEqual` pour empêcher les attaques temporelles (timing attacks).
  - Lien invalide ou altéré = Page d'erreur dédiée avec `HTTP 403`.

## 3. Verrouillage CORS Stricte
- Origines autorisées exclusivement :
  - `https://www.yanis-harrat.com`
  - `https://yanis-harrat.com`
  - Environnements locaux autorisés (`localhost:3000`, `localhost:3004`, `localhost:3005`, `127.0.0.1:*`).
- Toute autre origine est rejetée avec `Access-Control-Allow-Origin: null`.

## 4. Rate Limiting & Piège Honeypot
- **Honeypot :** Champ caché `hp_field` masqué par CSS absolu négatif et `aria-hidden="true"`. Rempli par un bot = rejet silencieux sans traitement Resend.
- **Rate-limiter en mémoire :** Limitation glissante à 5 requêtes par minute par adresse IP cliente, avec cooldown de 15 secondes par adresse email.

## 5. En-têtes HTTP Durcis (`vercel.json`)
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` (HSTS A+).
- `Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com; base-uri 'self'; form-action 'self';`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), browsing-topics=()`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
