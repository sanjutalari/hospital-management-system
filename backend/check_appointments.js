import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const appointments = await prisma.appointment.findMany({
    include: {
      patient: { include: { user: true } },
      doctor: { include: { user: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  console.log('\n📅 --- RECENT APPOINTMENTS --- 📅\n');
  if (appointments.length === 0) {
    console.log('No appointments found.');
  } else {
    appointments.forEach((a, i) => {
      console.log(`${i + 1}. PATIENT: ${a.patient.user.name}`);
      console.log(`   DOCTOR:  ${a.doctor.user.name}`);
      console.log(`   TIME:    ${a.scheduledAt.toLocaleString()}`);
      console.log(`   REASON:  ${a.reason}`);
      console.log(`   STATUS:  ${a.status}`);
      console.log('   -------------------');
    });
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
