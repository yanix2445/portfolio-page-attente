import { InfrastructureError } from '../core/errors.js';
import type { ResendContactPayload, ResendSendEmailPayload } from '../core/types.js';
import { APP_CONFIG } from './config.js';

export interface ResendContactRecord {
  id?: string;
  email?: string;
  unsubscribed?: boolean;
}

export class ResendClient {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.resend.com';

  constructor(apiKey = APP_CONFIG.resend.apiKey) {
    if (!apiKey) {
      console.warn('RESEND_API_KEY is not defined.');
    }
    this.apiKey = apiKey;
  }

  private getHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      ...extraHeaders
    };
  }

  async getContact(email: string): Promise<ResendContactRecord | null> {
    try {
      const res = await fetch(`${this.baseUrl}/contacts/${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!res.ok) {
        return null;
      }

      return (await res.json()) as ResendContactRecord;
    } catch (err) {
      console.warn('ResendClient getContact notice:', err);
      return null;
    }
  }

  async createContact(payload: ResendContactPayload): Promise<void> {
    const res = await fetch(`${this.baseUrl}/contacts`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      // En cas de conflit (déjà existant), forcer le statut souhaité via patch
      await this.patchContact(payload.email, payload.unsubscribed).catch(() => {});
    }
  }

  async patchContact(email: string, unsubscribed: boolean): Promise<void> {
    const res = await fetch(`${this.baseUrl}/contacts/${encodeURIComponent(email)}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ unsubscribed })
    });

    // Si 404, on crée le contact avec l'état demandé
    if (res.status === 404) {
      await fetch(`${this.baseUrl}/contacts`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ email, unsubscribed })
      }).catch(() => {});
    }
  }

  async sendEmail(
    payload: ResendSendEmailPayload,
    idempotencyKey?: string
  ): Promise<{ id: string }> {
    const headers = this.getHeaders(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {});

    const res = await fetch(`${this.baseUrl}/emails`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    const data = (await res.json().catch(() => ({}))) as { id?: string; message?: string };

    if (!res.ok || !data.id) {
      console.error('ResendClient sendEmail error:', data);
      throw new InfrastructureError(
        data.message || "Erreur lors de l'envoi de l'email via Resend."
      );
    }

    return { id: data.id };
  }
}
