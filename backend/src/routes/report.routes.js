import express from 'express';
import { uploadReport, getPatientReports, deleteReport } from '../controllers/report.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import multer from 'multer';

// For local dev, store in buffer
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();
router.post('/', authenticate, authorize('PATIENT'), upload.single('file'), uploadReport);
router.get('/me', authenticate, authorize('PATIENT'), getPatientReports);
router.get('/patient/:patientId', authenticate, authorize('DOCTOR'), getPatientReports);
router.delete('/:id', authenticate, authorize('PATIENT'), deleteReport);
export default router;