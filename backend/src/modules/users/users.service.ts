import { prisma } from '../../config/prisma';
import { AppError } from '../../errors/AppError';

/**
 * Returns all users with task count.
 * Password is never returned.
 */
export const getAllUsers = async () => {
  return prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: { tasks: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * Returns a single user by ID with their tasks.
 * Password is never returned.
 */
export const getUserById = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      tasks: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  return user;
};

/**
 * Deletes a user by ID.
 * - Prevents admin from deleting themselves.
 * - Cascade deletes the user's tasks (defined in Prisma schema).
 */
export const deleteUser = async (targetId: string, requestingUserId: string) => {
  if (targetId === requestingUserId) {
    throw new AppError('You cannot delete your own account.', 400);
  }

  const user = await prisma.user.findUnique({ where: { id: targetId } });
  if (!user) {
    throw new AppError('User not found.', 404);
  }

  await prisma.user.delete({ where: { id: targetId } });

  return { message: 'User deleted successfully.' };
};
