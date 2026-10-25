import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'node:crypto';
import { handleCors, generateUnsubscribeToken, verifyTurnstile } from './_security.js';

interface RateLimitEntry {
  count: number;
  first: number;
  last: number;
}

interface RateLimitResult {
  limited: boolean;
  reason?: string;
}

interface SubscribeRequestBody {
  email?: string;
  hp_field?: string;
  req_id?: string;
  turnstile_token?: string;
  'cf-turnstile-response'?: string;
}

interface ResendContact {
  id?: string;
  email?: string;
  unsubscribed?: boolean;
}

interface ResendSendEmailSuccess {
  id: string;
}

interface ResendErrorResponse {
  message?: string;
  statusCode?: number;
  name?: string;
}

// Rate limiting en mémoire (protection anti-burst & anti-spam)
const ipRateLimits = new Map<string, RateLimitEntry>();
const emailRateLimits = new Map<string, number>();

function checkRateLimit(ip: string, email: string): RateLimitResult {
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

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<VercelResponse | void> {
  // CORS strict avec whitelist d'origines
  const isOriginAllowed = handleCors(req, res, 'POST, OPTIONS');
  if (!isOriginAllowed) {
    return res.status(403).json({ error: 'Origine non autorisée par la politique de sécurité.' });
  }

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Méthode non autorisée.' });
  }

  try {
    let body: SubscribeRequestBody = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body) as SubscribeRequestBody;
      } catch {
        return res.status(400).json({ error: 'Format JSON invalide.' });
      }
    }

    const email = body?.email ? String(body.email).trim().toLowerCase() : '';
    const honeypot = body?.hp_field ? String(body.hp_field).trim() : '';
    const turnstileToken = body?.['cf-turnstile-response'] || body?.turnstile_token;

    // 1. Silent bot trap (Honeypot)
    if (honeypot) {
      return res.status(200).json({ success: true, message: 'Inscription confirmée.' });
    }

    // 2. Format d'email & longueur RFC 5321
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    if (!email || !emailRegex.test(email) || email.length > 254) {
      return res.status(400).json({ error: 'Veuillez saisir une adresse email valide.' });
    }

    // 3. Extraction d'IP fiable
    const headerForwarded = req.headers['x-forwarded-for'];
    const clientIp = (
      (typeof headerForwarded === 'string' ? headerForwarded.split(',')[0] : Array.isArray(headerForwarded) ? headerForwarded[0] : null) ||
      (typeof req.headers['x-real-ip'] === 'string' ? req.headers['x-real-ip'] : null) ||
      req.socket?.remoteAddress ||
      'anonymous'
    ).trim();

    // 4. Vérification Cloudflare Turnstile
    const turnstileCheck = await verifyTurnstile(turnstileToken, clientIp);
    if (!turnstileCheck.success) {
      return res.status(403).json({ error: turnstileCheck.reason || 'Vérification de sécurité échouée.' });
    }

    // 5. Contrôle de fréquence & anti-spam (IP & cooldown email)
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

    // 6. Vérification d'état dans Resend Contacts (Source unique de vérité)
    let existingContact: ResendContact | null = null;
    try {
      const getContactRes = await fetch(`https://api.resend.com/contacts/${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      if (getContactRes.ok) {
        existingContact = (await getContactRes.json()) as ResendContact;
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

    // 7. Signature HMAC du lien de désinscription pour cet utilisateur
    const unsubscribeToken = generateUnsubscribeToken(email);
    const unsubscribeUrl = `https://www.yanis-harrat.com/api/unsubscribe?email=${encodeURIComponent(email)}&token=${unsubscribeToken}`;

    // 8. Envoyer l'email de confirmation soigné (Design anti-slop, épuré, style Dovetail)
    const emailHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenue dans les coulisses · Yanis Harrat</title>
</head>
<body bgcolor="#0c0c0e" style="margin: 0; padding: 0; background-color: #0c0c0e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #d4d4d8; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0c0c0e; padding: 48px 16px;">
    <tr>
      <td align="center">
        <!-- Container principal unique, aéré et sans boîtes imbriquées -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; text-align: left;">
          
          <!-- En-tête sobre : Logo + Identité -->
          <tr>
            <td style="padding-bottom: 28px;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td width="36" valign="middle" style="padding-right: 12px;">
                    <img src="cid:yh-logo" width="32" height="32" alt="Yanis Harrat" style="display: block; border-radius: 8px;" />
                  </td>
                  <td valign="middle">
                    <div style="font-size: 14px; font-weight: 600; color: #ffffff; letter-spacing: -0.01em;">Yanis Harrat</div>
                    <div style="font-size: 12px; color: #71717a; margin-top: 1px;">BTS SIO SISR · Paris</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Titre direct -->
          <tr>
            <td style="padding-bottom: 18px;">
              <h1 style="margin: 0; font-size: 20px; font-weight: 600; color: #ffffff; letter-spacing: -0.015em; line-height: 1.35;">
                Bienvenue dans les coulisses
              </h1>
            </td>
          </tr>

          <!-- Corps du message -->
          <tr>
            <td style="font-size: 15px; line-height: 1.65; color: #a1a1aa; padding-bottom: 24px;">
              <p style="margin: 0 0 16px 0;">
                Bonjour,
              </p>
              <p style="margin: 0 0 16px 0;">
                Votre adresse <strong style="color: #ffffff;">${email}</strong> est bien enregistrée.
              </p>
              <p style="margin: 0 0 16px 0;">
                Mon objectif avec ce portfolio n'est pas de faire un énième CV en ligne, mais de montrer la réalité du terrain : des machines physiques, des clusters de virtualisation, des topologies réseau et des scripts d'automatisation documentés de A à Z.
              </p>
              <p style="margin: 0 0 24px 0;">
                Le site est en cours de finition. Dès que l'infrastructure est prête, vous recevrez un accès prioritaire.
              </p>
              <p style="margin: 0 0 16px 0; color: #d4d4d8; font-weight: 500;">
                En attendant l'ouverture, mes chantiers récents et mes dépôts de code sont accessibles ici :
              </p>

              <!-- Liens textuels discrets -->
              <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding-right: 12px;">
                    <a href="https://github.com/yanix2445" target="_blank" style="display: inline-block; padding: 9px 18px; background-color: #18181b; border: 1px solid #27272a; border-radius: 8px; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 500;">
                      GitHub ↗
                    </a>
                  </td>
                  <td>
                    <a href="https://www.linkedin.com/in/yanis-harrat/" target="_blank" style="display: inline-block; padding: 9px 18px; background-color: #18181b; border: 1px solid #27272a; border-radius: 8px; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 500;">
                      LinkedIn ↗
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Signature simple -->
          <tr>
            <td style="padding-top: 20px; border-top: 1px solid #1f1f23; font-size: 13px; color: #71717a; line-height: 1.5;">
              <div style="color: #ffffff; font-weight: 500;">Yanis Harrat</div>
              <div>Administration Systèmes, Réseaux & Cloud</div>
              <div><a href="https://www.yanis-harrat.com" style="color: #71717a; text-decoration: none;">yanis-harrat.com</a></div>
            </td>
          </tr>

          <!-- Footer désinscription épuré avec HMAC sécurisé -->
          <tr>
            <td style="padding-top: 28px; font-size: 11px; color: #52525b; line-height: 1.5;">
              Vous recevez cet email suite à votre inscription sur <a href="https://www.yanis-harrat.com" style="color: #71717a; text-decoration: underline;">yanis-harrat.com</a>.<br>
              Pour vous désinscrire en 1 clic : <a href="${unsubscribeUrl}" style="color: #71717a; text-decoration: underline;">Se désinscrire</a> · Contact : <a href="mailto:yanis@yanis-harrat.com" style="color: #71717a; text-decoration: underline;">yanis@yanis-harrat.com</a>.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const emailText = `Bonjour,

Votre adresse ${email} est bien enregistrée.

Mon objectif avec ce portfolio n'est pas de faire un énième CV en ligne, mais de montrer la réalité du terrain : des machines physiques, des clusters de virtualisation, des topologies réseau et des scripts d'automatisation documentés de A à Z.

Le site est en cours de finition. Dès que l'infrastructure est prête, vous recevrez un accès prioritaire.

En attendant l'ouverture, mes chantiers récents et mes dépôts de code sont accessibles ici :
- GitHub : https://github.com/yanix2445
- LinkedIn : https://www.linkedin.com/in/yanis-harrat/

À très vite,
Yanis Harrat
BTS SIO SISR · Paris
https://www.yanis-harrat.com

Pour vous désinscrire : ${unsubscribeUrl}`;

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
        subject: 'Bienvenue dans les coulisses · Yanis Harrat',
        html: emailHtml,
        text: emailText,
        tags: [
          { name: 'category', value: 'waitlist_confirmation' },
          { name: 'project', value: 'portfolio_page_attente' }
        ],
        headers: {
          'X-Entity-Ref-ID': `waitlist-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          'List-Unsubscribe': `<${unsubscribeUrl}>, <mailto:yanis@yanis-harrat.com?subject=Unsubscribe%20Waitlist>`,
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

    const sendEmailData = (await sendEmailRes.json().catch(() => ({}))) as ResendSendEmailSuccess & ResendErrorResponse;

    if (!sendEmailRes.ok) {
      console.error('Resend send email error:', sendEmailData);
      return res.status(500).json({
        error: "Contact enregistré mais une erreur est survenue lors de l'envoi de l'email de confirmation."
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
}
