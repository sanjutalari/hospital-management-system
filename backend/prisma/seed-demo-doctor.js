import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const email = 'doctor@hms.com';
const passwordHash = '$2a$12$t90CfIZ6VKDkc5ay2GGkGOQGoNVMWVaAewA58nND9Uf5n/MAXBB9q';

async function main() {
  const existing = await prisma.user.findUnique({
    where: { email },
    include: { doctor: true },
  });

  if (existing) {
    if (existing.role !== 'DOCTOR') {
      console.warn(`Skipped demo doctor: ${email} is already used by a non-doctor account.`);
      return;
    }

    if (!existing.doctor) {
      await prisma.doctor.create({
        data: {
          userId: existing.id,
          doctorCode: 'DOC-DEMO-001',
          specialty: 'Cardiology',
          licenseNumber: 'LIC-DEMO-001',
          department: 'Cardiology',
          bio: 'Demo account for initial HMS setup.',
        },
      });
      console.log(`Added the missing doctor profile for ${email}.`);
      return;
    }

    console.log(`Demo doctor already exists: ${email}.`);
    return;
  }

  await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: 'Dr. Ravi Mehta',
      role: 'DOCTOR',
      doctor: {
        create: {
          doctorCode: 'DOC-DEMO-001',
          specialty: 'Cardiology',
          licenseNumber: 'LIC-DEMO-001',
          department: 'Cardiology',
          bio: 'Demo account for initial HMS setup.',
        },
      },
    },
  });

  console.log(`Created demo doctor account: ${email}.`);
}

main()
  .catch((error) => {
    console.error('Could not initialize the demo doctor account:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
