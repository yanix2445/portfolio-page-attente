module.exports = async function handler(req, res) {
  // CORS & Security headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, List-Unsubscribe-Post');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).send('Erreur de configuration serveur.');
  }

  // Extraire l'email de la requête (query param ou body)
  let email = req.query?.email;
  if (!email && req.body) {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch(e) {}
    }
    email = body?.email;
  }

  if (email) {
    email = String(email).trim().toLowerCase();
    try {
      // Mettre à jour le statut dans Resend
      const patchRes = await fetch(`https://api.resend.com/contacts/${encodeURIComponent(email)}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ unsubscribed: true })
      });

      // Si le contact n'existait pas encore dans Contacts, l'enregistrer avec unsubscribed: true
      if (patchRes.status === 404) {
        await fetch('https://api.resend.com/contacts', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, unsubscribed: true })
        });
      }
    } catch (err) {
      console.error('Erreur de désinscription Resend:', err);
    }
  }

  // RFC 8058 One-Click POST response (envoyé automatiquement par Gmail / Yahoo)
  if (req.method === 'POST') {
    return res.status(200).send('Unsubscribed successfully');
  }

  // Réponse GET dans le navigateur : page design system minimaliste
  const displayEmail = email ? escapeHtml(email) : 'votre adresse email';
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
};

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
