const crypto = require('crypto');

// Rate limiting en mémoire (protection anti-burst & anti-spam)
const ipRateLimits = new Map();
const emailRateLimits = new Map();

function checkRateLimit(ip, email) {
  const now = Date.now();

  // Nettoyage périodique pour éviter toute fuite de mémoire
  if (ipRateLimits.size > 2000) {
    for (const [k, v] of ipRateLimits.entries()) {
      if (now - v.last > 120000) ipRateLimits.delete(k);
    }
  }
  if (emailRateLimits.size > 2000) {
    for (const [k, v] of emailRateLimits.entries()) {
      if (now - v > 120000) emailRateLimits.delete(k);
    }
  }

  // 1. Limite globale par IP : max 5 requêtes par fenêtre de 60 secondes
  const ipData = ipRateLimits.get(ip) || { count: 0, first: now, last: now };
  if (now - ipData.first < 60000) {
    if (ipData.count >= 5) {
      return { limited: true, reason: 'Trop de requêtes. Veuillez patienter 1 minute avant de réessayer.' };
    }
    ipData.count += 1;
    ipData.last = now;
  } else {
    ipData.count = 1;
    ipData.first = now;
    ipData.last = now;
  }
  ipRateLimits.set(ip, ipData);

  // 2. Cooldown par adresse email : max 1 soumission toutes les 15 secondes pour le même email
  const lastEmailAttempt = emailRateLimits.get(email);
  if (lastEmailAttempt && now - lastEmailAttempt < 15000) {
    return { limited: true, reason: 'Veuillez patienter quelques secondes avant de renvoyer ce formulaire.' };
  }
  emailRateLimits.set(email, now);

  return { limited: false };
}

module.exports = async function handler(req, res) {
  // CORS & Security headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Méthode non autorisée.' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        return res.status(400).json({ error: 'Format JSON invalide.' });
      }
    }

    const email = body?.email ? String(body.email).trim().toLowerCase() : '';
    const honeypot = body?.hp_field ? String(body.hp_field).trim() : '';

    // Silent bot trap
    if (honeypot) {
      return res.status(200).json({ success: true, message: 'Inscription confirmée.' });
    }

    // Email format validation
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    if (!email || !emailRegex.test(email) || email.length > 254) {
      return res.status(400).json({ error: 'Veuillez saisir une adresse email valide.' });
    }

    // Contrôle de fréquence & anti-spam (IP & cooldown email)
    const clientIp = (
      req.headers['x-forwarded-for']?.split(',')[0] ||
      req.headers['x-real-ip'] ||
      req.socket?.remoteAddress ||
      'anonymous'
    ).trim();

    const rateCheck = checkRateLimit(clientIp, email);
    if (rateCheck.limited) {
      return res.status(429).json({ error: rateCheck.reason });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const segmentId = process.env.RESEND_SEGMENT_ID || '573be7ef-e507-4299-9de5-3ef2dc46917c';

    if (!apiKey) {
      console.error('RESEND_API_KEY is not defined in environment variables.');
      return res.status(500).json({ error: 'Configuration serveur manquante (clé API).' });
    }

    // 1. Vérification d'état dans Resend Contacts (Source unique de vérité)
    let existingContact = null;
    try {
      const getContactRes = await fetch(`https://api.resend.com/contacts/${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      if (getContactRes.ok) {
        existingContact = await getContactRes.json().catch(() => null);
      }
    } catch (e) {
      console.warn('Notice verification contact:', e);
    }

    // Règle d'or : une adresse NE PEUT PAS se ré-inscrire si elle est déjà activement inscrite (unsubscribed === false)
    if (existingContact && existingContact.unsubscribed === false) {
      return res.status(200).json({
        success: true,
        alreadySubscribed: true,
        message: 'Vous êtes déjà inscrit sur la liste prioritaire avec cette adresse.'
      });
    }

    // Cas 1 : L'adresse était désinscrite (unsubscribed === true) -> RÉ-INSCRIPTION AUTORISÉE
    if (existingContact && existingContact.unsubscribed === true) {
      await fetch(`https://api.resend.com/contacts/${encodeURIComponent(email)}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ unsubscribed: false })
      }).catch((err) => console.warn('Resend contact patch notice:', err));
    } else if (!existingContact) {
      // Cas 2 : Première inscription (contact inexistant) -> CRÉATION DU CONTACT
      const contactPayload = {
        email,
        unsubscribed: false,
        segments: segmentId ? [{ id: segmentId }] : []
      };

      const contactRes = await fetch('https://api.resend.com/contacts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(contactPayload)
      });

      if (!contactRes.ok) {
        // En cas de conflit, forcer explicitement unsubscribed: false
        await fetch(`https://api.resend.com/contacts/${encodeURIComponent(email)}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ unsubscribed: false })
        }).catch(() => {});
      }
    }

    // 2. Envoyer l'email de confirmation soigné
    const emailHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmation d'inscription · Yanis Harrat</title>
</head>
<body style="margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f4f4f5; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #09090b; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Container principal -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; background-color: #121215; border: 1px solid #27272a; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);">
          
          <!-- Top Accent line -->
          <tr>
            <td height="3" style="background: linear-gradient(90deg, #ea580c 0%, #f97316 50%, #ea580c 100%);"></td>
          </tr>

          <!-- Header avec Badge et Logo CID -->
          <tr>
            <td style="padding: 36px 36px 20px 36px;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td width="48" valign="middle" style="padding-right: 14px;">
                    <img src="cid:yh-logo" width="42" height="42" alt="Logo Yanis Harrat" style="display: block; border-radius: 50%; border: 1px solid rgba(249, 115, 22, 0.4); box-shadow: 0 4px 14px rgba(234, 88, 12, 0.35);">
                  </td>
                  <td valign="middle">
                    <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="background-color: rgba(249, 115, 22, 0.12); border: 1px solid rgba(249, 115, 22, 0.35); border-radius: 9999px; padding: 4px 12px;">
                          <span style="font-family: 'SF Mono', Monaco, Menlo, Consolas, monospace; font-size: 11px; font-weight: 600; color: #fb923c; letter-spacing: 0.05em; text-transform: uppercase;">
                            BTS SIO SISR · PARIS
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <h1 style="margin: 20px 0 0 0; font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: -0.02em; line-height: 1.3;">
                Inscription confirmée !
              </h1>
            </td>
          </tr>

          <!-- Contenu principal -->
          <tr>
            <td style="padding: 0 36px 28px 36px; font-size: 15px; line-height: 1.6; color: #a1a1aa;">
              <p style="margin: 0 0 16px 0;">
                Bonjour,
              </p>
              <p style="margin: 0 0 16px 0;">
                Votre adresse <strong style="color: #ffffff;">${email}</strong> a bien été enregistrée pour le lancement officiel de mon portfolio.
              </p>
              <p style="margin: 0 0 24px 0;">
                Vous recevrez une notification prioritaire dès la mise en ligne pour découvrir mes projets d'infrastructure système, d'architecture réseau et de cybersécurité.
              </p>

              <!-- Box récapitulative -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #18181b; border: 1px solid #27272a; border-radius: 12px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td width="28" valign="top">
                          <span style="display: inline-block; width: 8px; height: 8px; background-color: #22c55e; border-radius: 50%; margin-top: 6px;"></span>
                        </td>
                        <td style="font-size: 13px; color: #d4d4d8; line-height: 1.5;">
                          <strong>Statut :</strong> Inscription active sur la liste prioritaire.<br>
                          <span style="color: #71717a; font-size: 12px;">Aucun spam garanti. Uniquement un email unique lors de la publication.</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 8px 0; color: #d4d4d8; font-size: 14px; font-weight: 500;">
                En attendant, retrouvez mes travaux et actualités :
              </p>

              <!-- Liens sociaux -->
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin-top: 14px;">
                <tr>
                  <td style="padding-right: 10px;">
                    <a href="https://www.linkedin.com/in/yanis-harrat/" target="_blank" style="display: inline-block; padding: 10px 18px; background-color: #27272a; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 600; border-radius: 10px; border: 1px solid #3f3f46;">
                      LinkedIn ↗
                    </a>
                  </td>
                  <td>
                    <a href="https://github.com/yanix2445" target="_blank" style="display: inline-block; padding: 10px 18px; background-color: #27272a; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 600; border-radius: 10px; border: 1px solid #3f3f46;">
                      GitHub ↗
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Signature & Footer -->
          <tr>
            <td style="padding: 24px 36px 32px 36px; border-top: 1px solid #27272a; background-color: #0d0d10;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="font-size: 14px; font-weight: 600; color: #ffffff;">Yanis Harrat</div>
                    <div style="font-size: 12px; color: #71717a; margin-top: 2px;">Étudiant BTS SIO SISR · Paris, France</div>
                    <div style="font-size: 12px; color: #71717a; margin-top: 2px;">
                      <a href="https://www.yanis-harrat.com" style="color: #ea580c; text-decoration: none;">www.yanis-harrat.com</a>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>

        <!-- Micro-footer désinscription -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; margin-top: 16px;">
          <tr>
            <td align="center" style="font-size: 11px; color: #52525b; line-height: 1.5;">
              Vous avez reçu cet email suite à votre inscription sur <a href="https://www.yanis-harrat.com" style="color: #71717a; text-decoration: underline;">yanis-harrat.com</a>.<br>
              Pour vous désinscrire en 1 clic : <a href="https://www.yanis-harrat.com/api/unsubscribe?email=${encodeURIComponent(email)}" style="color: #ea580c; text-decoration: underline;">Se désinscrire</a> · Contact : <a href="mailto:yanis@yanis-harrat.com" style="color: #71717a; text-decoration: underline;">yanis@yanis-harrat.com</a>.
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;

    const emailText = `Bonjour,\n\nVotre adresse ${email} a bien été enregistrée pour le lancement officiel de mon portfolio.\n\nVous recevrez une notification prioritaire dès la mise en ligne pour découvrir mes projets d'infrastructure système, réseau et cybersécurité (BTS SIO SISR).\n\nEn attendant, retrouvez mes travaux sur :\n- LinkedIn : https://www.linkedin.com/in/yanis-harrat/\n- GitHub : https://github.com/yanix2445\n\nÀ très vite,\nYanis Harrat\nParis, France\nhttps://www.yanis-harrat.com`;

    // Clé d'idempotence scoped par tentative (évite les doublons réseau tout en autorisant les ré-inscriptions volontaires)
    const emailHash = crypto.createHash('sha256').update(email).digest('hex').substring(0, 16);
    const attemptId = body?.req_id ? String(body.req_id).replace(/[^a-zA-Z0-9_-]/g, '').substring(0, 24) : Date.now().toString(36);
    const idempotencyKey = `waitlist-${emailHash}-${attemptId}`;

    const sendEmailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey
      },
      body: JSON.stringify({
        from: 'Yanis Harrat <contact@yanis-harrat.com>',
        to: [email],
        reply_to: 'yanis@yanis-harrat.com',
        subject: 'Confirmation : Inscription au lancement de mon portfolio · Yanis Harrat',
        html: emailHtml,
        text: emailText,
        tags: [
          { name: 'category', value: 'waitlist_confirmation' },
          { name: 'project', value: 'portfolio_page_attente' }
        ],
        headers: {
          'X-Entity-Ref-ID': `waitlist-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          'List-Unsubscribe': `<https://www.yanis-harrat.com/api/unsubscribe?email=${encodeURIComponent(email)}>, <mailto:yanis@yanis-harrat.com?subject=Unsubscribe%20Waitlist>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
        },
        attachments: [
          {
            path: 'https://www.yanis-harrat.com/apple-touch-icon.png',
            filename: 'yh-logo.png',
            content_id: 'yh-logo'
          }
        ]
      })
    });

    const sendEmailData = await sendEmailRes.json().catch(() => ({}));

    if (!sendEmailRes.ok) {
      console.error('Resend send email error:', sendEmailData);
      return res.status(500).json({
        error: 'Contact enregistré mais une erreur est survenue lors de l\'envoi de l\'email de confirmation.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Inscription confirmée ! Un email vient de vous être envoyé.',
      emailId: sendEmailData?.id
    });
  } catch (error) {
    console.error('Unhandled subscribe error:', error);
    return res.status(500).json({ error: 'Une erreur inattendue est survenue.' });
  }
};
