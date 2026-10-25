import { RateLimitError } from '../core/errors.js';

interface IpRateRecord {
  count: number;
  first: number;
  last: number;
}

export class RateLimiterService {
  private readonly ipLimits = new Map<string, IpRateRecord>();
  private readonly emailLimits = new Map<string, number>();

  constructor(
    private readonly maxIpRequestsPerWindow = 5,
    private readonly windowMs = 60000,
    private readonly emailCooldownMs = 15000
  ) {}

  private cleanOldEntries(now: number): void {
    if (this.ipLimits.size > 2000) {
      for (const [k, v] of this.ipLimits.entries()) {
        if (now - v.last > 120000) this.ipLimits.delete(k);
      }
    }
    if (this.emailLimits.size > 2000) {
      for (const [k, v] of this.emailLimits.entries()) {
        if (now - v > 120000) this.emailLimits.delete(k);
      }
    }
  }

  checkRateLimit(ip: string, email: string): void {
    const now = Date.now();
    this.cleanOldEntries(now);

    // 1. Limite globale par IP
    const ipData = this.ipLimits.get(ip) || { count: 0, first: now, last: now };
    if (now - ipData.first < this.windowMs) {
      if (ipData.count >= this.maxIpRequestsPerWindow) {
        throw new RateLimitError('Trop de requêtes. Veuillez patienter 1 minute avant de réessayer.');
      }
      ipData.count += 1;
      ipData.last = now;
    } else {
      ipData.count = 1;
      ipData.first = now;
      ipData.last = now;
    }
    this.ipLimits.set(ip, ipData);

    // 2. Cooldown par adresse email
    const lastEmailAttempt = this.emailLimits.get(email);
    if (lastEmailAttempt && now - lastEmailAttempt < this.emailCooldownMs) {
      throw new RateLimitError('Veuillez patienter quelques secondes avant de renvoyer ce formulaire.');
    }
    this.emailLimits.set(email, now);
  }
}

// Instance singleton pour conserver l'état en mémoire
export const defaultRateLimiter = new RateLimiterService();
