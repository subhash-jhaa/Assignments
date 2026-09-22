/**
 * Custom application error class.
 * Use this to throw structured HTTP errors from anywhere in the app.
 * The global error middleware (error.middleware.ts) will catch and format these.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Maintain proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);

    // Fix prototype chain for instanceof checks
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
