/**
 * Erreurs Typées du Domaine (Domain Errors)
 */

export abstract class DomainError extends Error {
  abstract readonly statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends DomainError {
  readonly statusCode = 400;
}

export class SecurityError extends DomainError {
  readonly statusCode = 403;
}

export class NotFoundError extends DomainError {
  readonly statusCode = 404;
}

export class MethodNotAllowedError extends DomainError {
  readonly statusCode = 405;
}

export class RateLimitError extends DomainError {
  readonly statusCode = 429;
}

export class InfrastructureError extends DomainError {
  readonly statusCode = 500;
}
