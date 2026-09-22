import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const passwordHashAdmin = await bcrypt.hash('Admin12345!', 10);
  const passwordHashUser = await bcrypt.hash('User12345!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@taskflow.dev' },
    update: {},
    create: {
      email: 'admin@taskflow.dev',
      password: passwordHashAdmin,
      role: 'ADMIN',
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@taskflow.dev' },
    update: {},
    create: {
      email: 'user@taskflow.dev',
      password: passwordHashUser,
      role: 'USER',
    },
  });

  // Seed sample tasks
  await prisma.task.createMany({
    data: [
      {
        title: 'Review Project Architecture',
        description: 'Check backend database schema, migrations, and API routes.',
        status: 'COMPLETED',
        userId: admin.id,
      },
      {
        title: 'Conduct User Management Audit',
        description: 'Verify RBAC access permissions for admin and normal users.',
        status: 'PENDING',
        userId: admin.id,
      },
      {
        title: 'Complete Onboarding Checklist',
        description: 'Setup development environment and test task tracker features.',
        status: 'PENDING',
        userId: user.id,
      },
      {
        title: 'Design Dashboard UI',
        description: 'Craft responsive layouts with filters, status badges, and smooth modal forms.',
        status: 'COMPLETED',
        userId: user.id,
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Database seeded successfully!');
  console.log(`- Admin: admin@taskflow.dev (Password: Admin12345!)`);
  console.log(`- User:  user@taskflow.dev  (Password: User12345!)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
