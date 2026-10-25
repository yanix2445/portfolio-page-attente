import type { VercelRequest, VercelResponse } from '@vercel/node';
import { DomainError } from '../src/core/errors.js';
import { handleCors } from '../src/infrastructure/security.provider.js';
import { UnsubscribeService } from '../src/services/unsubscribe.service.js';

const unsubscribeService = new UnsubscribeService();

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderSuccessHtml(email: string): string {
  const displayEmail = escapeHtml(email);
  return `<!DOCTYPE html>
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
}

function renderErrorHtml(message: string): string {
  return `<!DOCTYPE html>
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
      ${escapeHtml(message)} Pour toute demande manuelle, vous pouvez contacter <strong style="color: #ffffff;">yanis@yanis-harrat.com</strong>.
    </p>
    <a href="https://www.yanis-harrat.com" class="btn">Retourner à l'accueil</a>
  </div>
</body>
</html>`;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<VercelResponse | void> {
  // 1. Contrôle CORS
  if (!handleCors(req, res, 'GET, POST, OPTIONS')) {
    return res.status(403).json({ error: 'Origine non autorisée par la politique de sécurité.' });
  }

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Extraction des paramètres
  let email = typeof req.query?.email === 'string' ? req.query.email : undefined;
  let token = typeof req.query?.token === 'string' ? req.query.token : undefined;

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

  try {
    const result = await unsubscribeService.execute({
      email: email || '',
      token,
      isOneClick: req.method === 'POST'
    });

    if (req.method === 'POST') {
      return res.status(200).send('Unsubscribed successfully');
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(renderSuccessHtml(result.email));
  } catch (error) {
    const statusCode = error instanceof DomainError ? error.statusCode : 500;
    const message = error instanceof Error ? error.message : 'Une erreur inattendue est survenue.';

    if (req.method === 'POST') {
      return res.status(statusCode).send(message);
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(statusCode).send(renderErrorHtml(message));
  }
}
