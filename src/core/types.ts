/**
 * Types & Contrats du Domaine (Core Layer)
 */

export interface SubscribeInput {
  email: string;
  hpField?: string;
  reqId?: string;
  turnstileToken?: string;
  clientIp?: string;
  origin?: string;
}

export interface SubscribeResult {
  success: boolean;
  message: string;
  alreadySubscribed?: boolean;
  emailId?: string;
}

export interface UnsubscribeInput {
  email: string;
  token?: string;
  isOneClick?: boolean;
  origin?: string;
}

export interface UnsubscribeResult {
  success: boolean;
  email: string;
}

export interface RateLimitPolicy {
  maxIpRequestsPerMinute: number;
  emailCooldownMs: number;
}

export interface ResendContactPayload {
  email: string;
  unsubscribed: boolean;
  segments?: Array<{ id: string }>;
}

export interface ResendSendEmailPayload {
  from: string;
  to: string[];
  reply_to: string;
  subject: string;
  html: string;
  text: string;
  tags?: Array<{ name: string; value: string }>;
  headers?: Record<string, string>;
  attachments?: Array<{
    path: string;
    filename: string;
    content_id: string;
  }>;
}
