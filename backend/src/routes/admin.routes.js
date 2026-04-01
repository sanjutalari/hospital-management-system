import express from 'express';
import { prisma } from '../config/database.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get System Statistics (Admin Only)
router.get('/stats', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const [patientCount, doctorCount, appointmentCount, reportCount] = await Promise.all([
      prisma.patient.count(),
      prisma.doctor.count(),
      prisma.appointment.count(),
      prisma.report.count(),
    ]);

    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, role: true, createdAt: true, isActive: true }
    });

    res.json({
      success: true,
      stats: {
        patients: patientCount,
        doctors: doctorCount,
        appointments: appointmentCount,
        reports: reportCount,
      },
      recentUsers
    });
  } catch (err) {
    next(err);
  }
});

// List all users with pagination
router.get('/users', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true }
    });
    res.json({ success: true, users });
  } catch (err) {
    next(err);
  }
});

// Toggle user active status
router.patch('/users/:id/toggle-active', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive }
    });

    res.json({ success: true, user: updated });
  } catch (err) {
    next(err);
  }
});

export default router;
