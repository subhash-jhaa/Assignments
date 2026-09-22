import bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { signToken } from '../../utils/jwt.utils';
import { AppError } from '../../errors/AppError';
import type { RegisterBody, LoginBody, AuthResponse, SafeUser } from '../../types/auth.types';

const SALT_ROUNDS = 10;

/**
 * Strips password from user object before sending to client.
 */
const toSafeUser = (user: {
  id: string;
  email: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
  password: string;
}): SafeUser => {
  const { password: _password, ...safe } = user;
  return safe;
};

/**
 * Registers a new user.
 * - Checks for duplicate email (409)
 * - Hashes password with bcrypt
 * - Returns safe user (no password)
 */
export const registerUser = async (body: RegisterBody): Promise<SafeUser> => {
  const { email, password, role } = body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError('An account with this email already exists.', 409);
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role: role ?? 'USER',
    },
  });

  return toSafeUser(user);
};

/**
 * Logs in a user.
 * - Finds user by email (401 if not found)
 * - Compares passwords (401 if mismatch)
 * - Signs and returns JWT + safe user
 */
export const loginUser = async (body: LoginBody): Promise<AuthResponse> => {
  const { email, password } = body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError('Invalid email or password.', 401);
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    throw new AppError('Invalid email or password.', 401);
  }

  const token = signToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return { token, user: toSafeUser(user) };
};

/**
 * Retrieves the logged-in user's profile by ID.
 */
export const getMe = async (userId: string): Promise<SafeUser> => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError('User not found.', 404);
  }
  return toSafeUser(user);
};
