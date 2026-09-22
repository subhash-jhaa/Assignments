import './config/env'; // Validates env vars first — must be imported before anything else
import app from './app';
import { env } from './config/env';
import { prisma } from './config/prisma';

const startServer = async (): Promise<void> => {
  try {
    // Verify database connection before accepting requests
    await prisma.$connect();
    console.log('✅ Database connected successfully.');

    app.listen(env.port, () => {
      console.log(`🚀 Server running at http://localhost:${env.port}`);
      console.log(`📦 Environment: ${env.nodeEnv}`);
      console.log(`🔗 Health check: http://localhost:${env.port}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Closing server gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Closing server gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
