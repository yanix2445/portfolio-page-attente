import { SecurityError, InfrastructureError } from '../core/errors.js';
import { APP_CONFIG } from './config.js';

export async function verifyTurnstileToken(token?: string, clientIp?: string): Promise<void> {
  const secretKey = APP_CONFIG.turnstile.secretKey;

  // Si non configurée, Turnstile est passif
  if (!secretKey) {
    return;
  }

  if (!token) {
    throw new SecurityError('Validation de sécurité Turnstile absente.');
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
      throw new SecurityError('Échec de vérification du captcha Cloudflare Turnstile.');
    }
  } catch (err) {
    if (err instanceof SecurityError) throw err;
    console.error('Erreur Turnstile client:', err);
    throw new InfrastructureError('Erreur de communication avec le service de sécurité Cloudflare.');
  }
}
