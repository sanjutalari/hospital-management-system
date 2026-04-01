import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.chatMessage.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.medicalRecord.deleteMany();
  await prisma.report.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.user.deleteMany();

  const hash = (p) => bcrypt.hash(p, 10);

  // Create Admin User
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@hms.com',
      passwordHash: await hash('admin123'),
      name: 'System Administrator',
      role: 'ADMIN',
    },
  });

  // Create Doctor
  const doctorUser = await prisma.user.create({
    data: {
      email: 'doctor@hms.com',
      passwordHash: await hash('doctor123'),
      name: 'Dr. Ravi Mehta',
      role: 'DOCTOR',
      doctor: {
        create: {
          doctorCode: 'DOC-0001',
          specialty: 'Cardiology',
          licenseNumber: 'LIC-001',
          department: 'Cardiology',
          phone: '+91 98765 00001',
          bio: 'Experienced cardiologist with 15 years of practice.',
          available: true,
        },
      },
    },
    include: { doctor: true },
  });

  // Create Patient
  const patientUser = await prisma.user.create({
    data: {
      email: 'patient@hms.com',
      passwordHash: await hash('patient123'),
      name: 'Sarah Johnson',
      role: 'PATIENT',
      patient: {
        create: {
          patientCode: 'PAT-0001',
          age: 42,
          weightKg: 67.5,
          heightCm: 163,
          bloodType: 'O_POS',
          phone: '+91 98765 43210',
          medicalHistory: 'Type 2 Diabetes, mild hypertension',
        },
      },
    },
    include: { patient: true },
  });

  // Create Appointments
  const appt1 = await prisma.appointment.create({
    data: {
      patientId: patientUser.patient.id,
      doctorId: doctorUser.doctor.id,
      scheduledAt: new Date('2026-03-12T11:00:00Z'),
      status: 'COMPLETED',
      reason: 'Diabetes follow-up',
      notes: 'Patient doing well.',
    },
  });

  const appt2 = await prisma.appointment.create({
    data: {
      patientId: patientUser.patient.id,
      doctorId: doctorUser.doctor.id,
      scheduledAt: new Date('2026-04-14T10:30:00Z'),
      status: 'ACCEPTED',
      reason: 'Blood sugar checkup',
    },
  });

  await prisma.appointment.create({
    data: {
      patientId: patientUser.patient.id,
      doctorId: doctorUser.doctor.id,
      scheduledAt: new Date('2026-04-19T14:00:00Z'),
      status: 'PENDING',
      reason: 'Routine checkup',
    },
  });

  // Create Medical Record
  const record = await prisma.medicalRecord.create({
    data: {
      patientId: patientUser.patient.id,
      doctorId: doctorUser.doctor.id,
      appointmentId: appt1.id,
      diagnosis: 'Type 2 Diabetes (controlled)',
      symptoms: 'Fatigue, excessive thirst, frequent urination',
      advice: 'Low-carb diet, 30 min daily walk, monitor blood sugar',
      notes: 'Patient responding well to Metformin',
      prescriptions: {
        create: [
          {
            medicineName: 'Metformin',
            dosage: '500mg',
            frequency: 'Twice daily',
            durationDays: 30,
            instructions: 'Take after meals with water.',
          },
          {
            medicineName: 'Atorvastatin',
            dosage: '10mg',
            frequency: 'Once daily (night)',
            durationDays: 90,
          },
        ],
      },
    },
  });

  // Create Chat messages
  await prisma.chatMessage.createMany({
    data: [
      {
        senderId: doctorUser.id,
        receiverId: patientUser.id,
        content: 'Good morning Sarah! How are you feeling today? Any issues with the Metformin?',
        sentAt: new Date('2026-03-29T04:45:00Z'),
      },
      {
        senderId: patientUser.id,
        receiverId: doctorUser.id,
        content: 'Good morning Dr. Mehta! I\'m feeling much better. The medication seems to be working.',
        sentAt: new Date('2026-03-29T04:50:00Z'),
        isRead: true,
      },
      {
        senderId: doctorUser.id,
        receiverId: patientUser.id,
        content: 'Great to hear! Please make sure to check your blood sugar before breakfast every day.',
        sentAt: new Date('2026-03-29T04:55:00Z'),
      },
    ],
  });

  console.log('✅ Seed complete!');
  console.log('   Admin:   admin@hms.com   / admin123');
  console.log('   Doctor:  doctor@hms.com  / doctor123');
  console.log('   Patient: patient@hms.com / patient123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
