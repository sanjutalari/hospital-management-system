import express from 'express';
import { bookAppointment, updateAppointmentStatus, getPatientAppointments, getDoctorAppointments } from '../controllers/appointment.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();
router.post('/', authenticate, authorize('PATIENT'), bookAppointment);
router.get('/patient', authenticate, authorize('PATIENT'), getPatientAppointments);
router.get('/doctor', authenticate, authorize('DOCTOR'), getDoctorAppointments);
router.patch('/:id/status', authenticate, authorize('DOCTOR'), updateAppointmentStatus);
export default router;