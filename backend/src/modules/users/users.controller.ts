import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import * as usersService from './users.service';
import { AppError } from '../../errors/AppError';

const handleValidation = (req: Request) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg).join(' ');
    throw new AppError(messages, 422);
  }
};

/**
 * GET /api/users
 * Admin only
 */
export const getAllUsers = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const users = await usersService.getAllUsers();
    res.status(200).json({ users });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/users/:id
 * Admin only
 */
export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    handleValidation(req);
    const user = await usersService.getUserById(req.params.id);
    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/users/:id
 * Admin only — cannot delete self
 */
export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    handleValidation(req);
    const result = await usersService.deleteUser(req.params.id, req.user!.userId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
