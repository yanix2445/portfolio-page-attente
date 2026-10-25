import crypto from 'node:crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { APP_CONFIG } from './config.js';

export function isOriginAllowed(origin?: string): boolean {
  if (!origin) return true; // Direct/curl/same-origin
  return (APP_CONFIG.security.allowedOrigins as readonly string[]).includes(origin);
}

export function handleCors(
  req: VercelRequest,
  res: VercelResponse,
  allowedMethods: string = 'POST, OPTIONS'
): boolean {
  const origin = typeof req.headers.origin === 'string' ? req.headers.origin : undefined;

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', allowedMethods);
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, List-Unsubscribe-Post'
  );

  if (origin) {
    if (isOriginAllowed(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
      return true;
    }
    return false;
  }

  res.setHeader('Access-Control-Allow-Origin', APP_CONFIG.siteUrl);
  return true;
}

export function generateUnsubscribeToken(email: string): string {
  const cleanEmail = email.trim().toLowerCase();
  return crypto.createHmac('sha256', APP_CONFIG.security.unsubscribeSecret).update(cleanEmail).digest('hex');
}

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
