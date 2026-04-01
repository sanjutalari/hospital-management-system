import express from 'express';
import { getMyMedicalRecords } from '../controllers/doctor.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();
router.get('/me/records', authenticate, authorize('PATIENT'), getMyMedicalRecords);
export default router;