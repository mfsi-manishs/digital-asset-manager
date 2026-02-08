/**
 * @file error.utils.ts
 * @fileoverview This file contains the error utils
 */

/**
 * @class AppError
 * @classdesc This class contains the app error
 */
export class AppError extends Error {
  public statusCode: number;
  public readonly isOperational: boolean;

  /**
   * Creates a new AppError instance
   * @param {string} message The error message
   * @param {number} statusCode The HTTP status code associated with the error
   */
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Marks this as a known app error

    // Maintain correct stack trace (standard for Node.js)
    Error.captureStackTrace(this, this.constructor);

    // Fix for older TypeScript versions/transpilation issues
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = "Bad Request") {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized access") {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Permission denied") {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Conflict") {
    super(message, 409);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message: string = "Too Many Requests") {
    super(message, 429);
  }
}
export class InternalServerError extends AppError {
  constructor(message: string = "Internal Server Error") {
    super(message, 500);
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message: string = "Service Unavailable") {
    super(message, 503);
  }
}

export class GatewayTimeoutError extends AppError {
  constructor(message: string = "Gateway Timeout") {
    super(message, 504);
  }
}
