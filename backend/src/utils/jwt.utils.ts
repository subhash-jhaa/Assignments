import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../errors/AppError';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Signs a JWT token with the given payload.
 * Expiry is controlled by JWT_EXPIRES_IN env variable.
 */
export const signToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as jwt.SignOptions['expiresIn'],
  });
};

/**
 * Verifies and decodes a JWT token.
 * Throws AppError 401 if token is invalid or expired.
 */
export const verifyToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, env.jwtSecret) as JwtPayload;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new AppError('Token has expired. Please login again.', 401);
    }
    throw new AppError('Invalid token. Please login again.', 401);
  }
};
