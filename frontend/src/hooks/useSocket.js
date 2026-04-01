import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

export const useSocket = (userId) => {
  const socketRef   = useRef(null);
  const [online, setOnline]       = useState({});
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!userId) return;

    const token = localStorage.getItem('accessToken');
    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001', {
      auth: { token },
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => console.log('🔌 Socket connected'));

    socket.on('user_status', ({ userId: uid, online: isOnline }) => {
      setOnline(prev => ({ ...prev, [uid]: isOnline }));
    });

    socket.on('appointment_update', (data) => {
      setNotifications(prev => [
        { id: Date.now(), type: 'appointment', ...data },
        ...prev.slice(0, 19),
      ]);
    });

    socket.on('new_appointment', (data) => {
      setNotifications(prev => [
        { id: Date.now(), type: 'new_appointment', ...data },
        ...prev.slice(0, 19),
      ]);
    });

    return () => socket.disconnect();
  }, [userId]);

  return { socket: socketRef.current, online, notifications, setNotifications };
};
