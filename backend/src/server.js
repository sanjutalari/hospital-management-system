// ============================================================
// HMS — server.js  (Entry point)
// ============================================================

import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Server as SocketServer } from 'socket.io';
import dotenv from 'dotenv';
import morgan from 'morgan';

import { validateEnv } from './config/env-validator.js';
import { logger, morganStream } from './config/logger.js';
import authRoutes from './routes/auth.routes.js';
import patientRoutes from './routes/patient.routes.js';
import doctorRoutes from './routes/doctor.routes.js';
import appointmentRoutes from './routes/appointment.routes.js';
import chatRoutes from './routes/chat.routes.js';
import reportRoutes from './routes/report.routes.js';
import aiRoutes from './routes/ai.routes.js';
import adminRoutes from './routes/admin.routes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { initSocketService } from './services/socket.service.js';
import { prisma } from './config/database.js';

dotenv.config();

// Validate environment variables
validateEnv();

const app = express();
const httpServer = http.createServer(app);

// ─── Socket.io ──────────────────────────────────────────────
const io = new SocketServer(httpServer, {
  cors: {
    origin: (origin, cb) => {
      const allowed = (process.env.FRONTEND_URL || 'http://localhost:5173,http://localhost:5174').split(',').map(s => s.trim());
      if (!origin || allowed.includes(origin)) cb(null, true);
      else cb(new Error('CORS blocked'));
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// attach io to app so controllers can access it
app.set('io', io);
initSocketService(io);

// ─── Global Middleware ───────────────────────────────────────
// HTTP request logging
app.use(morgan('combined', { stream: morganStream }));

app.use(helmet());
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiter — relax for dev testing
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// ─── Routes ─────────────────────────────────────────────────
app.use('/api/auth',         authRoutes);
app.use('/api/patients',     patientRoutes);
app.use('/api/doctors',      doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/chat',         chatRoutes);
app.use('/api/reports',      reportRoutes);
app.use('/api/ai',           aiRoutes);
app.use('/api/admin',        adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Error Handler ───────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ────────────────────────────────────────────
const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, async () => {
  try {
    await prisma.$connect();
    logger.info('Database connected');
    logger.info(`HMS server running on port ${PORT}`);
    console.log('✅ Database connected');
    console.log(`🚀 HMS server running on port ${PORT}`);
  } catch (err) {
    logger.error('Database connection failed:', err);
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  httpServer.close(() => process.exit(0));
});

export { io };
