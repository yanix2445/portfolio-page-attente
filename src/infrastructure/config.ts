/**
 * Configuration d'Infrastructure & Variables d'Environnement
 */

export const APP_CONFIG = {
  siteUrl: 'https://www.yanis-harrat.com',
  resend: {
    apiKey: process.env.RESEND_API_KEY || '',
    segmentId: process.env.RESEND_SEGMENT_ID || '573be7ef-e507-4299-9de5-3ef2dc46917c',
    fromEmail: 'Yanis Harrat <contact@yanis-harrat.com>',
    replyTo: 'yanis@yanis-harrat.com'
  },
  turnstile: {
    secretKey: process.env.TURNSTILE_SECRET_KEY || ''
  },
  security: {
    unsubscribeSecret: process.env.UNSUBSCRIBE_SECRET || process.env.RESEND_API_KEY || 'yh-default-secure-salt-2026',
    allowedOrigins: [
      'https://www.yanis-harrat.com',
      'https://yanis-harrat.com',
      'http://localhost:3000',
      'http://localhost:3004',
      'http://localhost:3005',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3004',
      'http://127.0.0.1:3005'
    ]
  }
} as const;
