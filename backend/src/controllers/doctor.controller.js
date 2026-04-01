import { prisma } from '../config/database.js';

// Doctor adds medical record + prescriptions for a patient
export const addMedicalRecord = async (req, res) => {
  const { patientId, appointmentId, diagnosis, symptoms, advice, notes, prescriptions } = req.body;

  const doctor = await prisma.doctor.findUnique({ where: { userId: req.user.id } });
  if (!doctor) return res.status(403).json({ error: 'Doctor profile not found' });

  const record = await prisma.medicalRecord.create({
    data: {
      patientId,
      doctorId: doctor.id,
      appointmentId: appointmentId || null,
      diagnosis,
      symptoms,
      advice,
      notes,
      prescriptions: {
        create: prescriptions?.map(p => ({
          medicineName: p.medicineName,
          dosage:       p.dosage,
          frequency:    p.frequency,
          durationDays: p.durationDays,
          instructions: p.instructions || null,
        })) ?? [],
      },
    },
    include: { prescriptions: true },
  });

  if (appointmentId) {
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: 'COMPLETED' },
    });
  }

  res.status(201).json(record);
};

// Get full patient profile (doctor view)
export const getPatientForDoctor = async (req, res) => {
  const { patientId } = req.params;

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: {
      user: { select: { id: true, name: true, email: true } },
      records: {
        include: {
          prescriptions: true,
          doctor: { include: { user: { select: { name: true } } } },
        },
        orderBy: { createdAt: 'desc' },
      },
      appointments: { orderBy: { scheduledAt: 'desc' }, take: 10 },
      reports: { orderBy: { uploadedAt: 'desc' } },
    },
  });

  if (!patient) return res.status(404).json({ error: 'Patient not found' });
  res.json(patient);
};

// Get doctor's patient list (unique patients with appointments)
export const getDoctorPatients = async (req, res) => {
  const { search } = req.query;
  const doctor = await prisma.doctor.findUnique({ where: { userId: req.user.id } });
  if (!doctor) return res.status(404).json({ error: 'Not found' });

  const appts = await prisma.appointment.findMany({
    where: { doctorId: doctor.id },
    select: { patientId: true },
    distinct: ['patientId'],
  });
  const patientIds = appts.map(a => a.patientId);

  const where = { id: { in: patientIds } };
  if (search) {
    where.user = { name: { contains: search, mode: 'insensitive' } };
  }

  const patients = await prisma.patient.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, email: true } },
      appointments: {
        where: { doctorId: doctor.id },
        orderBy: { scheduledAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json(patients);
};

// Patient views their own records
export const getMyMedicalRecords = async (req, res) => {
  const patient = await prisma.patient.findUnique({ where: { userId: req.user.id } });
  if (!patient) return res.status(404).json({ error: 'Not found' });

  const records = await prisma.medicalRecord.findMany({
    where: { patientId: patient.id },
    include: {
      prescriptions: true,
      doctor: { include: { user: { select: { id: true, name: true, email: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json(records);
};

// Get all available doctors (patient view)
export const getDoctors = async (req, res) => {
  try {
    const doctors = await prisma.doctor.findMany({
      where: { available: true },
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { user: { name: 'asc' } },
    });
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
};