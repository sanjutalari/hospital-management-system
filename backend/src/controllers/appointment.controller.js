import { prisma } from '../config/database.js';

// Patient books an appointment
export const bookAppointment = async (req, res) => {
  const { doctorId, scheduledAt, reason } = req.body;

  const patient = await prisma.patient.findUnique({ where: { userId: req.user.id } });
  if (!patient) return res.status(404).json({ error: 'Patient profile not found' });

  const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
  if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
  if (!doctor.available) return res.status(400).json({ error: 'Doctor not available' });

  const target = new Date(scheduledAt);
  const conflict = await prisma.appointment.findFirst({
    where: {
      doctorId,
      scheduledAt: {
        gte: new Date(target.getTime() - 30 * 60_000),
        lte: new Date(target.getTime() + 30 * 60_000),
      },
      status: { in: ['PENDING', 'ACCEPTED'] },
    },
  });
  if (conflict) return res.status(409).json({ error: 'Time slot already booked' });

  const appointment = await prisma.appointment.create({
    data: { patientId: patient.id, doctorId, scheduledAt: target, reason },
    include: { doctor: { include: { user: { select: { id: true, name: true, email: true } } } } },
  });

  const io = req.app.get('io');
  io.to(`doctor_${doctorId}`).emit('new_appointment', {
    appointmentId: appointment.id,
    patientName: req.user.name,
    scheduledAt: appointment.scheduledAt,
  });

  res.status(201).json(appointment);
};

// Doctor updates appointment status
export const updateAppointmentStatus = async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  const doctor = await prisma.doctor.findUnique({ where: { userId: req.user.id } });
  if (!doctor) return res.status(403).json({ error: 'Doctor profile not found' });

  const appointment = await prisma.appointment.findFirst({
    where: { id, doctorId: doctor.id },
    include: { patient: { include: { user: { select: { id: true, name: true } } } } },
  });
  if (!appointment) return res.status(404).json({ error: 'Appointment not found' });

  const updated = await prisma.appointment.update({ where: { id }, data: { status, notes } });

  const io = req.app.get('io');
  io.to(`patient_${appointment.patient.userId}`).emit('appointment_update', {
    appointmentId: id,
    status,
    doctorName: req.user.name,
  });

  res.json(updated);
};

// Get patient's own appointments
export const getPatientAppointments = async (req, res) => {
  const patient = await prisma.patient.findUnique({ where: { userId: req.user.id } });
  if (!patient) return res.status(404).json({ error: 'Not found' });

  const appointments = await prisma.appointment.findMany({
    where: { patientId: patient.id },
    include: { doctor: { include: { user: { select: { id: true, name: true, email: true } } } } },
    orderBy: { scheduledAt: 'desc' },
  });
  res.json(appointments);
};

// Get doctor's appointments
export const getDoctorAppointments = async (req, res) => {
  const { status, date } = req.query;
  const doctor = await prisma.doctor.findUnique({ where: { userId: req.user.id } });
  if (!doctor) return res.status(404).json({ error: 'Not found' });

  const where = { doctorId: doctor.id };
  if (status) where.status = status;
  if (date) {
    const d = new Date(date);
    where.scheduledAt = {
      gte: new Date(d.setHours(0, 0, 0, 0)),
      lte: new Date(d.setHours(23, 59, 59, 999)),
    };
  }

  const appointments = await prisma.appointment.findMany({
    where,
    include: { patient: { include: { user: { select: { id: true, name: true, email: true } } } } },
    orderBy: { scheduledAt: 'asc' },
  });
  res.json(appointments);
};