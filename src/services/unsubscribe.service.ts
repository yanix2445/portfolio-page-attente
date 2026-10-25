import { SecurityError } from '../core/errors.js';
import type { UnsubscribeInput, UnsubscribeResult } from '../core/types.js';
import { validateEmail } from '../core/validation.js';
import { ResendClient } from '../infrastructure/resend.client.js';
import { verifyUnsubscribeToken } from '../infrastructure/security.provider.js';

export class UnsubscribeService {
  constructor(private readonly resendClient = new ResendClient()) {}

  async execute(input: UnsubscribeInput): Promise<UnsubscribeResult> {
    const email = validateEmail(input.email);

    // Vérification cryptographique de la signature HMAC anti-usurpation
    const isTokenValid = verifyUnsubscribeToken(email, input.token);
    if (!isTokenValid) {
      throw new SecurityError('Jeton de désinscription invalide ou manquant.');
    }

    // Désinscription effective dans Resend
    await this.resendClient.patchContact(email, true);

    return {
      success: true,
      email
    };
  }
}
