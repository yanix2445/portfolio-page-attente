import type { VercelRequest, VercelResponse } from '@vercel/node';
import { DomainError } from '../src/core/errors.js';
import { handleCors } from '../src/infrastructure/security.provider.js';
import { SubscriptionService } from '../src/services/subscription.service.js';

const subscriptionService = new SubscriptionService();

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<VercelResponse | void> {
  // 1. Contrôle CORS
  if (!handleCors(req, res, 'POST, OPTIONS')) {
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
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        return res.status(400).json({ error: 'Format JSON invalide.' });
      }
    }

    const headerForwarded = req.headers['x-forwarded-for'];
    const clientIp = (
      (typeof headerForwarded === 'string'
        ? headerForwarded.split(',')[0]
        : Array.isArray(headerForwarded)
          ? headerForwarded[0]
          : null) ||
      (typeof req.headers['x-real-ip'] === 'string' ? req.headers['x-real-ip'] : null) ||
      req.socket?.remoteAddress ||
      'anonymous'
    ).trim();

    const result = await subscriptionService.execute({
      email: body?.email,
      hpField: body?.hp_field,
      reqId: body?.req_id,
      turnstileToken: body?.['cf-turnstile-response'] || body?.turnstile_token,
      clientIp
    });

    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof DomainError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    console.error('Unhandled subscribe error:', error);
    return res.status(500).json({ error: 'Une erreur inattendue est survenue.' });
  }
}
