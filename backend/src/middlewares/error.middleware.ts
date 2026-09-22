import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { env } from '../config/env';

/**
 * Global error handling middleware.
 * Must be registered LAST in app.ts (after all routes).
 *
 * Handles:
 * - AppError (operational errors): returns structured JSON with statusCode
 * - Prisma errors: maps common error codes to readable messages
 * - Unknown errors: returns 500 in production (hides details), full error in dev
 */
export const errorMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  // Handle known operational AppErrors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      statusCode: err.statusCode,
    });
    return;
  }

  // Handle Prisma unique constraint violations
  if ((err as any).code === 'P2002') {
    res.status(409).json({
      error: 'A record with this value already exists.',
      statusCode: 409,
    });
    return;
  }

  // Handle Prisma record not found
  if ((err as any).code === 'P2025') {
    res.status(404).json({
      error: 'Record not found.',
      statusCode: 404,
    });
    return;
  }

  // Unknown / programming errors
  console.error('[Unhandled Error]', err);

  res.status(500).json({
    error: env.isProduction ? 'Internal server error.' : err.message,
    statusCode: 500,
    ...(env.isProduction ? {} : { stack: err.stack }),
  });
};
