import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import * as tasksService from './tasks.service';
import { AppError } from '../../errors/AppError';

const handleValidation = (req: Request) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg).join(' ');
    throw new AppError(messages, 422);
  }
};

/**
 * GET /api/tasks
 * Admin: all tasks | User: own tasks
 */
export const getTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId, role } = req.user!;
    const tasks = await tasksService.getTasks(userId, role, req.query as any);
    res.status(200).json({ tasks });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/tasks/:id
 */
export const getTaskById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId, role } = req.user!;
    const task = await tasksService.getTaskById(req.params.id, userId, role);
    res.status(200).json({ task });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/tasks
 */
export const createTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    handleValidation(req);
    const task = await tasksService.createTask(req.user!.userId, req.body);
    res.status(201).json({ task });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/tasks/:id
 */
export const updateTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    handleValidation(req);
    const { userId, role } = req.user!;
    const task = await tasksService.updateTask(req.params.id, userId, role, req.body);
    res.status(200).json({ task });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/tasks/:id
 */
export const deleteTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId, role } = req.user!;
    const result = await tasksService.deleteTask(req.params.id, userId, role);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
