import crypto from 'node:crypto';
import type { SubscribeInput, SubscribeResult } from '../core/types.js';
import { validateEmail, isHoneypotTriggered } from '../core/validation.js';
import { APP_CONFIG } from '../infrastructure/config.js';
import { ResendClient } from '../infrastructure/resend.client.js';
import { generateUnsubscribeToken } from '../infrastructure/security.provider.js';
import { verifyTurnstileToken } from '../infrastructure/turnstile.client.js';
import { defaultRateLimiter, RateLimiterService } from './rate-limiter.service.js';
import { buildConfirmationEmail } from '../templates/confirmation.template.js';

export class SubscriptionService {
  constructor(
    private readonly resendClient = new ResendClient(),
    private readonly rateLimiter: RateLimiterService = defaultRateLimiter
  ) {}

  async execute(input: SubscribeInput): Promise<SubscribeResult> {
    // 1. Détection silent bot trap (Honeypot)
    if (isHoneypotTriggered(input.hpField)) {
      return { success: true, message: 'Inscription confirmée.' };
    }

    // 2. Validation d'entrée
    const email = validateEmail(input.email);
    const clientIp = input.clientIp || 'anonymous';

    // 3. Vérification Cloudflare Turnstile
    await verifyTurnstileToken(input.turnstileToken, clientIp);

    // 4. Contrôle de fréquence
    this.rateLimiter.checkRateLimit(clientIp, email);

    // 5. Vérification d'état dans Resend Contacts
    const existingContact = await this.resendClient.getContact(email);

    // Si déjà inscrit activement : ne pas renvoyer d'email
    if (existingContact && existingContact.unsubscribed === false) {
      return {
        success: true,
        alreadySubscribed: true,
        message: 'Vous êtes déjà inscrit sur la liste prioritaire avec cette adresse.'
      };
    }

    // 6. Gestion du contact (Ré-inscription ou Première inscription)
    if (existingContact && existingContact.unsubscribed === true) {
      await this.resendClient.patchContact(email, false);
    } else if (!existingContact) {
      await this.resendClient.createContact({
        email,
        unsubscribed: false,
        segments: APP_CONFIG.resend.segmentId ? [{ id: APP_CONFIG.resend.segmentId }] : []
      });
    }

    // 7. Signature HMAC sécurisée du lien de désinscription
    const token = generateUnsubscribeToken(email);
    const unsubscribeUrl = `${APP_CONFIG.siteUrl}/api/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`;

    // 8. Génération du template email
    const emailContent = buildConfirmationEmail({ email, unsubscribeUrl });

    // 9. Envoi de l'email via Resend avec Idempotency-Key
    const emailHash = crypto.createHash('sha256').update(email).digest('hex').substring(0, 16);
    const attemptId = input.reqId ? String(input.reqId).replace(/[^a-zA-Z0-9_-]/g, '').substring(0, 24) : Date.now().toString(36);
    const idempotencyKey = `waitlist-${emailHash}-${attemptId}`;

    const sendResult = await this.resendClient.sendEmail(
      {
        from: APP_CONFIG.resend.fromEmail,
        to: [email],
        reply_to: APP_CONFIG.resend.replyTo,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
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
            path: `${APP_CONFIG.siteUrl}/apple-touch-icon.png`,
            filename: 'yh-logo.png',
            content_id: 'yh-logo'
          }
        ]
      },
      idempotencyKey
    );

    return {
      success: true,
      message: 'Inscription confirmée ! Un email vient de vous être envoyé.',
      emailId: sendResult.id
    };
  }
}
