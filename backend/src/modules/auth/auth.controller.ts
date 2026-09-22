import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import * as authService from './auth.service';
import { AppError } from '../../errors/AppError';

/**
 * Helper: extract validation errors and throw AppError if any exist.
 */
const handleValidation = (req: Request) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg).join(' ');
    throw new AppError(messages, 422);
  }
};

/**
 * POST /api/auth/register
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    handleValidation(req);
    const user = await authService.registerUser(req.body);
    res.status(201).json({ message: 'User registered successfully.', user });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/login
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    handleValidation(req);
    const result = await authService.loginUser(req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/me
 * Requires: authenticate middleware
 */
export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated.', 401);
    }
    const user = await authService.getMe(req.user.userId);
    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
};
