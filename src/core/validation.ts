import { ValidationError } from './errors.js';

const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export function sanitizeEmail(rawEmail?: unknown): string {
  if (typeof rawEmail !== 'string') return '';
  return rawEmail.trim().toLowerCase();
}

export function validateEmail(rawEmail?: unknown): string {
  const email = sanitizeEmail(rawEmail);

  if (!email || !EMAIL_REGEX.test(email) || email.length > 254) {
    throw new ValidationError('Veuillez saisir une adresse email valide.');
  }

  return email;
}

export function isHoneypotTriggered(hpField?: unknown): boolean {
  if (!hpField) return false;
  return typeof hpField === 'string' && hpField.trim().length > 0;
}
