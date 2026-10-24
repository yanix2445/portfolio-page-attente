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

    const apiKey = process.env.RESEND_API_KEY;
    const segmentId = process.env.RESEND_SEGMENT_ID || '573be7ef-e507-4299-9de5-3ef2dc46917c';

    if (!apiKey) {
      console.error('RESEND_API_KEY is not defined in environment variables.');
      return res.status(500).json({ error: 'Configuration serveur manquante (clé API).' });
    }

    // 1. Ajouter le contact dans Resend
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
      const errData = await contactRes.json().catch(() => ({}));
      console.warn('Resend contacts create notice:', errData);
      // We continue even if contact was already present
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
              Vous avez reçu cet email car vous avez renseigné votre adresse sur le site <a href="https://www.yanis-harrat.com" style="color: #71717a; text-decoration: underline;">yanis-harrat.com</a>.<br>
              Pour toute question : <a href="mailto:yanis@yanis-harrat.com" style="color: #71717a; text-decoration: underline;">yanis@yanis-harrat.com</a>.
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;

    const emailText = `Bonjour,\n\nVotre adresse ${email} a bien été enregistrée pour le lancement officiel de mon portfolio.\n\nVous recevrez une notification prioritaire dès la mise en ligne pour découvrir mes projets d'infrastructure système, réseau et cybersécurité (BTS SIO SISR).\n\nEn attendant, retrouvez mes travaux sur :\n- LinkedIn : https://www.linkedin.com/in/yanis-harrat/\n- GitHub : https://github.com/yanix2445\n\nÀ très vite,\nYanis Harrat\nParis, France\nhttps://www.yanis-harrat.com`;

    // Idempotency key derived safely from email
    const idempotencyKey = `waitlist-${Buffer.from(email).toString('base64').replace(/=/g, '')}`;

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
