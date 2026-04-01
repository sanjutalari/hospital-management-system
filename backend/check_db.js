import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { role: 'PATIENT' },
    include: { patient: true },
    orderBy: { createdAt: 'desc' },
  });

  console.log('\n📋 --- REGISTERED PATIENTS --- 📋\n');
  if (users.length === 0) {
    console.log('No patients found.');
  } else {
    users.forEach((u, i) => {
      console.log(`${i + 1}. NAME: ${u.name}`);
      console.log(`   EMAIL: ${u.email}`);
      console.log(`   CODE:  ${u.patient?.patientCode || 'N/A'}`);
      console.log(`   CREATED: ${u.createdAt.toLocaleString()}`);
      console.log('   -------------------');
    });
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
