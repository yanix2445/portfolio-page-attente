import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCors, verifyUnsubscribeToken } from './_security.js';

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<VercelResponse | void> {
  // CORS strict
  const isOriginAllowed = handleCors(req, res, 'GET, POST, OPTIONS');
  if (!isOriginAllowed) {
    return res.status(403).json({ error: 'Origine non autorisée par la politique de sécurité.' });
  }

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).send('Erreur de configuration serveur.');
  }

  // Extraire l'email et le jeton de la requête (query param ou body)
  let email: string | undefined = typeof req.query?.email === 'string' ? req.query.email : undefined;
  let token: string | undefined = typeof req.query?.token === 'string' ? req.query.token : undefined;

  if ((!email || !token) && req.body) {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {}
    }
    if (body) {
      if (typeof body.email === 'string') email = body.email;
      if (typeof body.token === 'string') token = body.token;
    }
  }

  if (!email) {
    return res.status(400).send('Adresse email requise pour la désinscription.');
  }

  const cleanEmail = email.trim().toLowerCase();

  // Vérification de la signature cryptographique HMAC anti-usurpation
  const isTokenValid = verifyUnsubscribeToken(cleanEmail, token);
  if (!isTokenValid) {
    if (req.method === 'POST') {
      return res.status(403).send('Jeton de désinscription invalide ou manquant.');
    }

    const invalidHtml = `<!DOCTYPE html>
<html lang="fr" class="h-full bg-[#09090b] text-zinc-100">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lien invalide · Yanis Harrat</title>
  <style>
    body {
      margin: 0;
      background-color: #09090b;
      color: #f4f4f5;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
      box-sizing: border-box;
    }
    .card {
      max-width: 440px;
      width: 100%;
      background-color: #121215;
      border: 1px solid #27272a;
      border-radius: 20px;
      padding: 36px 32px;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
    }
    h1 { margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #ef4444; }
    p { margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #a1a1aa; }
    .btn { display: inline-block; padding: 10px 22px; border-radius: 12px; background-color: #27272a; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 600; border: 1px solid #3f3f46; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Lien de désinscription non valide</h1>
    <p>
      Ce lien ne dispose pas d'une signature de sécurité valide ou a été altéré. Pour toute demande manuelle, vous pouvez contacter <strong style="color: #ffffff;">yanis@yanis-harrat.com</strong>.
    </p>
    <a href="https://www.yanis-harrat.com" class="btn">Retourner à l'accueil</a>
  </div>
</body>
</html>`;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(403).send(invalidHtml);
  }

  // Désinscription effective dans Resend
  try {
    const patchRes = await fetch(`https://api.resend.com/contacts/${encodeURIComponent(cleanEmail)}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ unsubscribed: true })
    });

    if (patchRes.status === 404) {
      await fetch('https://api.resend.com/contacts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: cleanEmail, unsubscribed: true })
      });
    }
  } catch (err) {
    console.error('Erreur de désinscription Resend:', err);
  }

  // RFC 8058 One-Click POST response
  if (req.method === 'POST') {
    return res.status(200).send('Unsubscribed successfully');
  }

  // Page de confirmation GET
  const displayEmail = escapeHtml(cleanEmail);
  const html = `<!DOCTYPE html>
<html lang="fr" class="h-full bg-[#09090b] text-zinc-100">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Désinscription confirmée · Yanis Harrat</title>
  <style>
    body {
      margin: 0;
      background-color: #09090b;
      color: #f4f4f5;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
      box-sizing: border-box;
    }
    .card {
      max-width: 440px;
      width: 100%;
      background-color: #121215;
      border: 1px solid #27272a;
      border-radius: 20px;
      padding: 36px 32px;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
    }
    .badge {
      display: inline-block;
      background-color: rgba(249, 115, 22, 0.12);
      border: 1px solid rgba(249, 115, 22, 0.35);
      border-radius: 9999px;
      padding: 4px 12px;
      font-size: 11px;
      font-weight: 600;
      color: #fb923c;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      font-family: "SF Mono", Monaco, Menlo, Consolas, monospace;
      margin-bottom: 20px;
    }
    h1 {
      margin: 0 0 12px 0;
      font-size: 22px;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: -0.02em;
    }
    p {
      margin: 0 0 24px 0;
      font-size: 14px;
      line-height: 1.6;
      color: #a1a1aa;
    }
    strong {
      color: #ffffff;
    }
    .btn {
      display: inline-block;
      padding: 10px 22px;
      border-radius: 12px;
      background-color: #27272a;
      color: #ffffff;
      text-decoration: none;
      font-size: 13px;
      font-weight: 600;
      border: 1px solid #3f3f46;
      transition: all 0.15s ease;
    }
    .btn:hover {
      background-color: #3f3f46;
      border-color: #52525b;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">BTS SIO SISR · PARIS</div>
    <h1>Désinscription confirmée</h1>
    <p>
      L'adresse <strong>${displayEmail}</strong> a bien été retirée de la liste d'attente du portfolio. Vous ne recevrez aucune autre communication.
    </p>
    <a href="https://www.yanis-harrat.com" class="btn">Retourner à l'accueil</a>
  </div>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(200).send(html);
}
