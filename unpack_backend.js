const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'backend', 'src');
const ctrlDir = path.join(srcDir, 'controllers');
const routesDir = path.join(srcDir, 'routes');
const midDir = path.join(srcDir, 'middleware');

fs.mkdirSync(ctrlDir, { recursive: true });
fs.mkdirSync(routesDir, { recursive: true });
fs.mkdirSync(midDir, { recursive: true });

const controllersStr = fs.readFileSync(path.join(__dirname, 'controllers.js'), 'utf8');
const chunks = controllersStr.split('// ─────────────────────────────────────────────────────────────');

const extractFile = (chunk) => {
  const match = chunk.match(/\(controllers\/([^)]+)\)/);
  if (match) {
    const filename = match[1];
    fs.writeFileSync(path.join(ctrlDir, filename), chunk.trim());
    console.log(`Created ${filename}`);
  }
};

chunks.forEach(extractFile);

// Routes
const authRoutes = `import express from 'express';
import { registerPatient, login, refreshToken, logout, getMe } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
router.post('/register/patient', registerPatient);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);
export default router;`;
fs.writeFileSync(path.join(routesDir, 'auth.routes.js'), authRoutes);

const apptRoutes = `import express from 'express';
import { bookAppointment, updateAppointmentStatus, getPatientAppointments, getDoctorAppointments } from '../controllers/appointment.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();
router.post('/', authenticate, authorize('PATIENT'), bookAppointment);
router.get('/patient', authenticate, authorize('PATIENT'), getPatientAppointments);
router.get('/doctor', authenticate, authorize('DOCTOR'), getDoctorAppointments);
router.patch('/:id/status', authenticate, authorize('DOCTOR'), updateAppointmentStatus);
export default router;`;
fs.writeFileSync(path.join(routesDir, 'appointment.routes.js'), apptRoutes);

const patientRoutes = `import express from 'express';
import { getMyMedicalRecords } from '../controllers/doctor.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();
router.get('/me/records', authenticate, authorize('PATIENT'), getMyMedicalRecords);
export default router;`;
fs.writeFileSync(path.join(routesDir, 'patient.routes.js'), patientRoutes);

const doctorRoutes = `import express from 'express';
import { addMedicalRecord, getPatientForDoctor, getDoctorPatients } from '../controllers/doctor.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();
router.post('/records', authenticate, authorize('DOCTOR'), addMedicalRecord);
router.get('/patients', authenticate, authorize('DOCTOR'), getDoctorPatients);
router.get('/patients/:patientId', authenticate, authorize('DOCTOR'), getPatientForDoctor);
export default router;`;
fs.writeFileSync(path.join(routesDir, 'doctor.routes.js'), doctorRoutes);

const reportRoutes = `import express from 'express';
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
export default router;`;
fs.writeFileSync(path.join(routesDir, 'report.routes.js'), reportRoutes);

const chatRoutes = `import express from 'express';
import { getConversation, getConversationList } from '../controllers/chat.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
router.get('/conversations', authenticate, getConversationList);
router.get('/:userId', authenticate, getConversation);
export default router;`;
fs.writeFileSync(path.join(routesDir, 'chat.routes.js'), chatRoutes);

const errorMiddleware = `export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
};`;
fs.writeFileSync(path.join(midDir, 'errorHandler.js'), errorMiddleware);

console.log('Unpack complete.');
