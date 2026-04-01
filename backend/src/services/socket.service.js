// ============================================================
// HMS — services/socket.service.js
// Real-time chat + notifications via Socket.io
// ============================================================

import jwt from 'jsonwebtoken';
import { prisma } from '../config/database.js';

// Map: userId -> Set of socket ids (a user can have multiple tabs open)
const userSockets = new Map();

export const initSocketService = (io) => {

  // ─── Authentication middleware for sockets ─────────────
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication required'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, name: true, role: true },
      });

      if (!user) return next(new Error('User not found'));

      socket.userId   = user.id;
      socket.userName = user.name;
      socket.userRole = user.role;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  // ─── Connection ────────────────────────────────────────
  io.on('connection', (socket) => {
    const { userId, userName, userRole } = socket;
    console.log(`🔌 ${userRole} connected: ${userName} (${userId})`);

    // Join a personal room — used for directed notifications
    socket.join(`user_${userId}`);

    // Also join role-based room for doctor or patient
    if (userRole === 'DOCTOR') socket.join(`doctor_${userId}`);
    if (userRole === 'PATIENT') socket.join(`patient_${userId}`);

    // Track socket ids per user
    if (!userSockets.has(userId)) userSockets.set(userId, new Set());
    userSockets.get(userId).add(socket.id);

    // Broadcast online status to contacts
    io.emit('user_status', { userId, online: true });

    // ─── SEND MESSAGE ──────────────────────────────────
    socket.on('send_message', async ({ receiverId, content }) => {
      if (!receiverId || !content?.trim()) return;

      try {
        // Persist to database
        const message = await prisma.chatMessage.create({
          data: { senderId: userId, receiverId, content: content.trim() },
          include: {
            sender:   { select: { id: true, name: true, role: true } },
            receiver: { select: { id: true, name: true, role: true } },
          },
        });

        // Emit to sender (for echo + optimistic UI sync)
        socket.emit('message_sent', message);

        // Emit to receiver's personal room
        io.to(`user_${receiverId}`).emit('new_message', message);

        // If receiver is offline, we could trigger push notification here
        if (!userSockets.has(receiverId) || userSockets.get(receiverId).size === 0) {
          // TODO: integrate push/email notification via notification.service.js
          console.log(`📧 User ${receiverId} is offline — push notification would fire`);
        }
      } catch (err) {
        socket.emit('message_error', { error: 'Failed to send message' });
      }
    });

    // ─── TYPING INDICATOR ─────────────────────────────
    socket.on('typing_start', ({ receiverId }) => {
      io.to(`user_${receiverId}`).emit('typing', { senderId: userId, name: userName });
    });

    socket.on('typing_stop', ({ receiverId }) => {
      io.to(`user_${receiverId}`).emit('stopped_typing', { senderId: userId });
    });

    // ─── MARK MESSAGES AS READ ────────────────────────
    socket.on('mark_read', async ({ senderId }) => {
      await prisma.chatMessage.updateMany({
        where: { senderId, receiverId: userId, isRead: false },
        data: { isRead: true },
      });
      io.to(`user_${senderId}`).emit('messages_read', { by: userId });
    });

    // ─── JOIN APPOINTMENT ROOM ────────────────────────
    // For real-time appointment notifications
    socket.on('join_appointment_room', ({ appointmentId }) => {
      socket.join(`appointment_${appointmentId}`);
    });

    // ─── DISCONNECT ───────────────────────────────────
    socket.on('disconnect', () => {
      const sockets = userSockets.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          userSockets.delete(userId);
          io.emit('user_status', { userId, online: false });
        }
      }
      console.log(`🔌 ${userRole} disconnected: ${userName}`);
    });
  });
};

/** Emit a notification to a specific user (callable from controllers) */
export const notifyUser = (io, userId, event, data) => {
  io.to(`user_${userId}`).emit(event, data);
};

/** Check if a user is currently online */
export const isOnline = (userId) =>
  userSockets.has(userId) && userSockets.get(userId).size > 0;
