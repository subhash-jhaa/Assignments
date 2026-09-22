import { PrismaClient } from '@prisma/client';
import { env } from './env';

// Prevent multiple Prisma instances in development (hot reload)
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma: PrismaClient =
  global.__prisma ??
  new PrismaClient({
    log: env.isProduction ? ['error'] : ['query', 'warn', 'error'],
  });

if (!env.isProduction) {
  global.__prisma = prisma;
}
