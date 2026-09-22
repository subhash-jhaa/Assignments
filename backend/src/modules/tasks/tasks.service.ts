import { TaskStatus } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { AppError } from '../../errors/AppError';
import type { CreateTaskBody, UpdateTaskBody, TaskQueryParams } from '../../types/task.types';

/**
 * Gets tasks.
 * - Admins get ALL tasks with user info embedded.
 * - Regular users get only their own tasks.
 * Supports optional status filter.
 */
export const getTasks = async (
  userId: string,
  role: string,
  query: TaskQueryParams
) => {
  const { status } = query;

  const whereClause = {
    ...(role !== 'ADMIN' ? { userId } : {}),
    ...(status ? { status: status as TaskStatus } : {}),
  };

  return prisma.task.findMany({
    where: whereClause,
    include: {
      user: {
        select: { id: true, email: true, role: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * Gets a single task by ID.
 * - Admin can access any task.
 * - User can only access their own (403 otherwise).
 */
export const getTaskById = async (taskId: string, userId: string, role: string) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      user: { select: { id: true, email: true, role: true } },
    },
  });

  if (!task) {
    throw new AppError('Task not found.', 404);
  }

  if (role !== 'ADMIN' && task.userId !== userId) {
    throw new AppError('You do not have permission to view this task.', 403);
  }

  return task;
};

/**
 * Creates a new task for the authenticated user.
 */
export const createTask = async (userId: string, body: CreateTaskBody) => {
  const { title, description, status } = body;

  return prisma.task.create({
    data: {
      title,
      description,
      status: status ?? 'PENDING',
      userId,
    },
    include: {
      user: { select: { id: true, email: true, role: true } },
    },
  });
};

/**
 * Updates an existing task.
 * - Admin can update any task.
 * - User can only update their own (403 otherwise).
 */
export const updateTask = async (
  taskId: string,
  userId: string,
  role: string,
  body: UpdateTaskBody
) => {
  const existing = await prisma.task.findUnique({ where: { id: taskId } });

  if (!existing) {
    throw new AppError('Task not found.', 404);
  }

  if (role !== 'ADMIN' && existing.userId !== userId) {
    throw new AppError('You do not have permission to update this task.', 403);
  }

  return prisma.task.update({
    where: { id: taskId },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.status !== undefined && { status: body.status }),
    },
    include: {
      user: { select: { id: true, email: true, role: true } },
    },
  });
};

/**
 * Deletes a task by ID.
 * - Admin can delete any task.
 * - User can only delete their own (403 otherwise).
 */
export const deleteTask = async (taskId: string, userId: string, role: string) => {
  const existing = await prisma.task.findUnique({ where: { id: taskId } });

  if (!existing) {
    throw new AppError('Task not found.', 404);
  }

  if (role !== 'ADMIN' && existing.userId !== userId) {
    throw new AppError('You do not have permission to delete this task.', 403);
  }

  await prisma.task.delete({ where: { id: taskId } });

  return { message: 'Task deleted successfully.' };
};
