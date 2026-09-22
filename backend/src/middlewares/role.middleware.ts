import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';

/**
 * Middleware factory: Require specific role(s).
 * Must be used AFTER authenticate middleware.
 *
 * Usage:
 *   router.get('/admin-only', authenticate, requireRole('ADMIN'), handler)
 *   router.get('/multi-role', authenticate, requireRole('ADMIN', 'USER'), handler)
 */
export const requireRole = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Not authenticated.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. Required role: ${roles.join(' or ')}.`,
          403
        )
      );
    }

    next();
  };
};

/**
 * Convenience shorthand for admin-only routes.
 */
export const requireAdmin = requireRole('ADMIN');
