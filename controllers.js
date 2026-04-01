// ============================================================
// HMS — All Route Handlers + Controllers
// ============================================================

// ─────────────────────────────────────────────────────────────
// APPOINTMENT CONTROLLER  (controllers/appointment.controller.js)
// ─────────────────────────────────────────────────────────────

import { prisma } from '../config/database.js';

// Patient books an appointment
export const bookAppointment = async (req, res) => {
  const { doctorId, scheduledAt, reason } = req.body;

  const patient = await prisma.patient.findUnique({
    where: { userId: req.user.id },
  });
  if (!patient) return res.status(404).json({ error: 'Patient profile not found' });

  const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
  if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
  if (!doctor.available) return res.status(400).json({ error: 'Doctor not available' });

  // Check for existing appointment in same time slot (±30 min)
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
    include: {
      doctor: { include: { user: { select: { name: true } } } },
    },
  });

  // Emit notification via Socket.io
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

  const updated = await prisma.appointment.update({
    where: { id },
    data: { status, notes },
  });

  // Notify patient
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
    include: {
      doctor: {
        include: { user: { select: { name: true } } },
      },
    },
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
    include: {
      patient: {
        include: { user: { select: { name: true, email: true } } },
      },
    },
    orderBy: { scheduledAt: 'asc' },
  });

  res.json(appointments);
};


// ─────────────────────────────────────────────────────────────
// MEDICAL RECORDS CONTROLLER (controllers/doctor.controller.js)
// ─────────────────────────────────────────────────────────────

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

  // Mark appointment as completed if linked
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
      user: { select: { name: true, email: true } },
      records: {
        include: { prescriptions: true, doctor: { include: { user: { select: { name: true } } } } },
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

  // Get unique patient IDs from appointments
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
      user: { select: { name: true, email: true } },
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
      doctor: { include: { user: { select: { name: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json(records);
};


// ─────────────────────────────────────────────────────────────
// REPORT CONTROLLER  (controllers/report.controller.js)
// ─────────────────────────────────────────────────────────────

import cloudinary from '../config/cloudinary.js';

// Upload PDF or image report (patient)
export const uploadReport = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const patient = await prisma.patient.findUnique({ where: { userId: req.user.id } });
  if (!patient) return res.status(404).json({ error: 'Patient not found' });

  // Upload to Cloudinary
  const uploadResult = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `hms/reports/${patient.id}`,
        resource_type: 'auto',
        format: 'pdf',
      },
      (err, result) => err ? reject(err) : resolve(result)
    );
    stream.end(req.file.buffer);
  });

  const report = await prisma.report.create({
    data: {
      patientId:    patient.id,
      title:        req.body.title || req.file.originalname,
      fileUrl:      uploadResult.secure_url,
      cloudinaryId: uploadResult.public_id,
      reportType:   req.body.reportType || 'OTHER',
    },
  });

  res.status(201).json(report);
};

// Get patient's reports
export const getPatientReports = async (req, res) => {
  const patientId = req.params.patientId || 
    (await prisma.patient.findUnique({ where: { userId: req.user.id } }))?.id;

  if (!patientId) return res.status(404).json({ error: 'Not found' });

  const reports = await prisma.report.findMany({
    where: { patientId },
    orderBy: { uploadedAt: 'desc' },
  });

  res.json(reports);
};

// Delete report (patient only, own report)
export const deleteReport = async (req, res) => {
  const patient = await prisma.patient.findUnique({ where: { userId: req.user.id } });
  const report  = await prisma.report.findFirst({
    where: { id: req.params.id, patientId: patient.id },
  });
  if (!report) return res.status(404).json({ error: 'Report not found' });

  await cloudinary.uploader.destroy(report.cloudinaryId, { resource_type: 'raw' });
  await prisma.report.delete({ where: { id: report.id } });

  res.json({ message: 'Report deleted' });
};


// ─────────────────────────────────────────────────────────────
// CHAT CONTROLLER  (controllers/chat.controller.js)
// ─────────────────────────────────────────────────────────────

// Get conversation history between current user and another user
export const getConversation = async (req, res) => {
  const myId    = req.user.id;
  const otherId = req.params.userId;
  const limit   = parseInt(req.query.limit) || 50;
  const cursor  = req.query.cursor; // message id for pagination

  const messages = await prisma.chatMessage.findMany({
    where: {
      OR: [
        { senderId: myId,    receiverId: otherId },
        { senderId: otherId, receiverId: myId   },
      ],
    },
    orderBy: { sentAt: 'desc' },
    take: limit,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  // Mark received messages as read
  await prisma.chatMessage.updateMany({
    where: { senderId: otherId, receiverId: myId, isRead: false },
    data: { isRead: true },
  });

  res.json(messages.reverse());
};

// Get list of conversations (unique chat partners)
export const getConversationList = async (req, res) => {
  const myId = req.user.id;

  const messages = await prisma.chatMessage.findMany({
    where: { OR: [{ senderId: myId }, { receiverId: myId }] },
    orderBy: { sentAt: 'desc' },
    include: {
      sender:   { select: { id: true, name: true, role: true } },
      receiver: { select: { id: true, name: true, role: true } },
    },
  });

  // Deduplicate by partner
  const seen = new Map();
  for (const msg of messages) {
    const partner = msg.senderId === myId ? msg.receiver : msg.sender;
    if (!seen.has(partner.id)) {
      seen.set(partner.id, {
        partner,
        lastMessage: msg.content,
        lastAt: msg.sentAt,
        unread: 0,
      });
    }
    if (msg.receiverId === myId && !msg.isRead) {
      seen.get(partner.id).unread++;
    }
  }

  res.json(Array.from(seen.values()));
};
