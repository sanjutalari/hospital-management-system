import express from 'express';
import { addMedicalRecord, getPatientForDoctor, getDoctorPatients, getDoctors } from '../controllers/doctor.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all doctors (needed for patients to book)
router.get('/', authenticate, getDoctors);

router.post('/records', authenticate, authorize('DOCTOR'), addMedicalRecord);
router.get('/patients', authenticate, authorize('DOCTOR'), getDoctorPatients);
router.get('/patients/:patientId', authenticate, authorize('DOCTOR'), getPatientForDoctor);

export default router;