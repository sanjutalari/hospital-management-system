import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database.js';

const SALT_ROUNDS = 12;

/** Generate short-lived access token (15 min) */
const signAccess = (userId, role) =>
  jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: '15m' });

/** Generate long-lived refresh token (7 days) */
const signRefresh = (userId) =>
  jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

// ─── REGISTER PATIENT ────────────────────────────────────────
export const registerPatient = async (req, res) => {
  const { name, email, password, age, phone } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: 'Email already registered' });

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Generate next patient code
  const count = await prisma.patient.count();
  const patientCode = `PAT-${String(count + 1).padStart(4, '0')}`;

  const user = await prisma.user.create({
    data: {
      email, passwordHash, name,
      role: 'PATIENT',
      patient: {
        create: { patientCode, age: age ? parseInt(age) : null, phone },
      },
    },
    include: { patient: true },
  });

  const accessToken  = signAccess(user.id, user.role);
  const refreshToken = signRefresh(user.id);

  await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });

  res.status(201).json({
    message: 'Patient registered successfully',
    accessToken, refreshToken,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    patientCode,
  });
};

// ─── LOGIN (both patient and doctor) ────────────────────────
export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
    include: { patient: true, doctor: true },
  });

  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  if (!user.isActive) return res.status(403).json({ error: 'Account deactivated' });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const accessToken  = signAccess(user.id, user.role);
  const refreshToken = signRefresh(user.id);

  await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });

  res.json({
    accessToken, refreshToken,
    user: {
      id: user.id, name: user.name, email: user.email, role: user.role,
      profileId: user.patient?.id || user.doctor?.id,
      code: user.patient?.patientCode || user.doctor?.doctorCode,
      // Include health stats for dashboard
      bloodType: user.patient?.bloodType,
      weight: user.patient?.weightKg,
      height: user.patient?.heightCm,
      specialty: user.doctor?.specialty,
      licenseNumber: user.doctor?.licenseNumber,
    },
  });
};

// ─── REFRESH TOKEN ───────────────────────────────────────────
export const refreshToken = async (req, res) => {
  const { refreshToken: token } = req.body;
  if (!token) return res.status(400).json({ error: 'Refresh token required' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user || user.refreshToken !== token) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const newAccess  = signAccess(user.id, user.role);
    const newRefresh = signRefresh(user.id);
    await prisma.user.update({ where: { id: user.id }, data: { refreshToken: newRefresh } });

    res.json({ accessToken: newAccess, refreshToken: newRefresh });
  } catch {
    res.status(401).json({ error: 'Expired or invalid refresh token' });
  }
};

// ─── LOGOUT ──────────────────────────────────────────────────
export const logout = async (req, res) => {
  await prisma.user.update({
    where: { id: req.user.id },
    data: { refreshToken: null },
  });
  res.json({ message: 'Logged out successfully' });
};

// ─── GET CURRENT USER (me) ───────────────────────────────────
export const getMe = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { patient: true, doctor: true },
    omit: { passwordHash: true, refreshToken: true },
  });
  res.json(user);
};
