import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'node:crypto';

export const ALLOWED_ORIGINS = [
  'https://www.yanis-harrat.com',
  'https://yanis-harrat.com',
  'http://localhost:3000',
  'http://localhost:3004',
  'http://localhost:3005',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3004',
  'http://127.0.0.1:3005'
];

/**
 * Configure les en-têtes CORS stricts et valide l'origine de l'appelant.
 * Retourne false si une origine web explicite est fournie mais n'est pas autorisée.
 */
export function handleCors(req: VercelRequest, res: VercelResponse, allowedMethods: string = 'POST, OPTIONS'): boolean {
  const origin = typeof req.headers.origin === 'string' ? req.headers.origin : undefined;

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', allowedMethods);
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, List-Unsubscribe-Post'
  );

  if (origin) {
    if (ALLOWED_ORIGINS.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
      return true;
    }
    // Origine interdite (appel tiers non autorisé)
    return false;
  }

  // Même origine ou requête directe (serveur / curl)
  res.setHeader('Access-Control-Allow-Origin', 'https://www.yanis-harrat.com');
  return true;
}

/**
 * Clé secrète utilisée pour signer les jetons de désinscription.
 */
function getHmacSecret(): string {
  return process.env.UNSUBSCRIBE_SECRET || process.env.RESEND_API_KEY || 'yh-default-secure-salt-2026';
}

/**
 * Génère une signature HMAC-SHA256 pour sécuriser le lien de désinscription d'une adresse email.
 */
export function generateUnsubscribeToken(email: string): string {
  const cleanEmail = email.trim().toLowerCase();
  return crypto.createHmac('sha256', getHmacSecret()).update(cleanEmail).digest('hex');
}

/**
 * Valide cryptographiquement le jeton de désinscription (protection anti-timing attack).
 */
export function verifyUnsubscribeToken(email: string, token?: string): boolean {
  if (!token || typeof token !== 'string') return false;
  const expected = generateUnsubscribeToken(email);

  if (token.length !== expected.length) return false;

  try {
    return crypto.timingSafeEqual(Buffer.from(token, 'utf-8'), Buffer.from(expected, 'utf-8'));
  } catch {
    return false;
  }
}

/**
 * Valide un jeton Cloudflare Turnstile auprès des serveurs Cloudflare.
 */
export async function verifyTurnstile(
  token?: string,
  clientIp?: string
): Promise<{ success: boolean; reason?: string }> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  // Si aucune clé secrète n'est configurée, Turnstile est passif (ne bloque pas les soumissions légitimes)
  if (!secretKey) {
    return { success: true };
  }

  if (!token) {
    return { success: false, reason: 'Validation de sécurité Turnstile absente.' };
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);
    if (clientIp && clientIp !== 'anonymous') {
      formData.append('remoteip', clientIp);
    }

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    });

    const data = (await response.json()) as { success: boolean; 'error-codes'?: string[] };

    if (!data.success) {
      return { success: false, reason: 'Échec de vérification du captcha Cloudflare Turnstile.' };
    }

    return { success: true };
  } catch (err) {
    console.error('Erreur de validation Turnstile:', err);
    return { success: false, reason: 'Erreur de communication avec le service de sécurité Cloudflare.' };
  }
}
