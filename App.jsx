// ============================================================
// HMS FRONTEND — Complete React Application
// ============================================================
// File layout (all in /frontend/src/):
//
//  context/AuthContext.jsx       — JWT auth state + axios
//  hooks/useSocket.js            — Socket.io hook
//  services/api.js               — All API calls
//  components/auth/LoginPage.jsx
//  components/patient/PatientDashboard.jsx
//  components/patient/PatientProfile.jsx
//  components/patient/AppointmentBook.jsx
//  components/patient/ReportUpload.jsx
//  components/doctor/DoctorDashboard.jsx
//  components/doctor/PatientPanel.jsx
//  components/doctor/PrescriptionForm.jsx
//  components/shared/ChatBox.jsx
//  components/shared/Sidebar.jsx
//  components/shared/NotificationBell.jsx
//  App.jsx
// ============================================================


// ─────────────────────────────────────────────────────────────
// context/AuthContext.jsx
// ─────────────────────────────────────────────────────────────

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Axios instance with automatic token refresh
export const api = axios.create({ baseURL: API_BASE });

// Request interceptor — attach access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken });
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await api.post('/auth/register/patient', payload);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try { await api.post('/auth/logout'); } catch {}
    localStorage.clear();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};


// ─────────────────────────────────────────────────────────────
// hooks/useSocket.js
// ─────────────────────────────────────────────────────────────

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


// ─────────────────────────────────────────────────────────────
// services/api.js — All API calls in one place
// ─────────────────────────────────────────────────────────────

// Re-export the api instance from AuthContext
// import { api } from '../context/AuthContext';

export const appointmentService = {
  book:    (data)         => api.post('/appointments', data),
  myList:  ()             => api.get('/appointments/patient'),
  doctorList: (params)    => api.get('/appointments/doctor', { params }),
  update:  (id, data)     => api.patch(`/appointments/${id}/status`, data),
};

export const medicalService = {
  addRecord:    (data)    => api.post('/doctors/records', data),
  myRecords:    ()        => api.get('/patients/me/records'),
  patientFull:  (id)      => api.get(`/doctors/patients/${id}`),
  patientList:  (params)  => api.get('/doctors/patients', { params }),
};

export const reportService = {
  upload: (formData)      => api.post('/reports', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  myReports: ()           => api.get('/reports/me'),
  patientReports: (id)    => api.get(`/reports/patient/${id}`),
  delete: (id)            => api.delete(`/reports/${id}`),
};

export const chatService = {
  history:  (userId, params) => api.get(`/chat/${userId}`, { params }),
  threads:  ()               => api.get('/chat/conversations'),
};

export const doctorService = {
  list: (params) => api.get('/doctors', { params }),
};


// ─────────────────────────────────────────────────────────────
// components/shared/ChatBox.jsx
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { chatService } from '../../services/api';

export const ChatBox = ({ partner, socket, online }) => {
  const { user }             = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState('');
  const [typing, setTyping]     = useState(false);
  const [loading, setLoading]   = useState(true);
  const endRef                  = useRef(null);
  const typingTimer             = useRef(null);

  useEffect(() => {
    if (!partner?.id) return;
    setLoading(true);
    chatService.history(partner.id)
      .then(r => { setMessages(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [partner?.id]);

  useEffect(() => {
    if (!socket) return;

    socket.on('new_message', (msg) => {
      if (msg.senderId === partner?.id || msg.receiverId === partner?.id) {
        setMessages(prev => [...prev, msg]);
        socket.emit('mark_read', { senderId: partner.id });
      }
    });

    socket.on('message_sent', (msg) => {
      // update optimistic message with server-confirmed one
      setMessages(prev => prev.map(m => m._temp && m.content === msg.content ? msg : m));
    });

    socket.on('typing', ({ senderId }) => {
      if (senderId === partner?.id) setTyping(true);
    });
    socket.on('stopped_typing', ({ senderId }) => {
      if (senderId === partner?.id) setTyping(false);
    });

    return () => {
      socket.off('new_message');
      socket.off('message_sent');
      socket.off('typing');
      socket.off('stopped_typing');
    };
  }, [socket, partner?.id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const handleSend = () => {
    if (!input.trim() || !socket) return;
    // Optimistic update
    const tempMsg = {
      _temp: true, id: `temp-${Date.now()}`,
      senderId: user.id, receiverId: partner.id,
      content: input.trim(), sentAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempMsg]);
    socket.emit('send_message', { receiverId: partner.id, content: input.trim() });
    socket.emit('typing_stop', { receiverId: partner.id });
    setInput('');
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (!socket) return;
    socket.emit('typing_start', { receiverId: partner.id });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(
      () => socket.emit('typing_stop', { receiverId: partner.id }), 1500
    );
  };

  if (!partner) return (
    <div className="flex-1 flex items-center justify-center text-gray-400">
      <div className="text-center">
        <div className="text-4xl mb-2">💬</div>
        <p>Select a conversation to start chatting</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white">
        <div className="relative">
          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm">
            {partner.name?.charAt(0)}
          </div>
          {online[partner.id] && (
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
          )}
        </div>
        <div>
          <p className="font-medium text-sm text-gray-800">{partner.name}</p>
          <p className="text-xs text-gray-400">{online[partner.id] ? 'Online' : 'Offline'}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-gray-50">
        {loading && <p className="text-center text-gray-400 text-sm">Loading messages...</p>}
        {messages.map((msg) => {
          const isMine = msg.senderId === user.id;
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-2xl text-sm leading-relaxed
                ${isMine
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : 'bg-white text-gray-800 shadow-sm rounded-bl-sm border border-gray-100'
                } ${msg._temp ? 'opacity-70' : ''}`}
              >
                {msg.content}
                <span className={`block text-xs mt-1 ${isMine ? 'text-blue-200' : 'text-gray-400'}`}>
                  {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {msg._temp && ' · sending...'}
                </span>
              </div>
            </div>
          );
        })}
        {typing && (
          <div className="flex justify-start">
            <div className="bg-white px-3 py-2 rounded-2xl rounded-bl-sm border border-gray-100 shadow-sm">
              <div className="flex gap-1 items-center h-4">
                {[0, 1, 2].map(i => (
                  <span key={i} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 bg-white border-t border-gray-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center
              hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};


// ─────────────────────────────────────────────────────────────
// components/doctor/PrescriptionForm.jsx
// ─────────────────────────────────────────────────────────────

import { useState } from 'react';
import { medicalService } from '../../services/api';

export const PrescriptionForm = ({ patient, appointmentId, onSuccess }) => {
  const [form, setForm] = useState({
    diagnosis: '', symptoms: '', advice: '', notes: '',
  });
  const [prescriptions, setPrescriptions] = useState([
    { medicineName: '', dosage: '', frequency: '', durationDays: 7, instructions: '' },
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const updatePrescription = (idx, field, value) => {
    setPrescriptions(prev => prev.map((p, i) => i === idx ? { ...p, [field]: value } : p));
  };

  const addMedicine = () =>
    setPrescriptions(prev => [
      ...prev,
      { medicineName: '', dosage: '', frequency: '', durationDays: 7, instructions: '' },
    ]);

  const removeMedicine = (idx) =>
    setPrescriptions(prev => prev.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    if (!form.diagnosis) return setError('Diagnosis is required');
    setSaving(true);
    setError('');
    try {
      await medicalService.addRecord({
        patientId: patient.id,
        appointmentId,
        ...form,
        prescriptions: prescriptions.filter(p => p.medicineName),
      });
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save record');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Clinical fields */}
      {[
        { key: 'diagnosis', label: 'Diagnosis', placeholder: 'Primary diagnosis...' },
        { key: 'symptoms',  label: 'Symptoms',  placeholder: 'Observed symptoms...' },
        { key: 'advice',    label: 'Advice',     placeholder: 'Patient advice...' },
        { key: 'notes',     label: 'Notes',      placeholder: 'Internal notes...' },
      ].map(({ key, label, placeholder }) => (
        <div key={key}>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            {label}
          </label>
          <textarea
            rows={2}
            value={form[key]}
            onChange={(e) => setForm(prev => ({ ...prev, [key]: e.target.value }))}
            placeholder={placeholder}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
      ))}

      {/* Prescriptions */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Prescriptions
          </label>
          <button onClick={addMedicine}
            className="text-xs text-blue-600 font-medium hover:text-blue-800">
            + Add medicine
          </button>
        </div>

        <div className="space-y-3">
          {prescriptions.map((p, idx) => (
            <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-2 gap-2 mb-2">
                <input
                  placeholder="Medicine name"
                  value={p.medicineName}
                  onChange={e => updatePrescription(idx, 'medicineName', e.target.value)}
                  className="col-span-2 px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
                <input
                  placeholder="Dosage (e.g. 500mg)"
                  value={p.dosage}
                  onChange={e => updatePrescription(idx, 'dosage', e.target.value)}
                  className="px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
                <input
                  placeholder="Frequency (e.g. Twice daily)"
                  value={p.frequency}
                  onChange={e => updatePrescription(idx, 'frequency', e.target.value)}
                  className="px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="number" min="1" max="365"
                    placeholder="Days"
                    value={p.durationDays}
                    onChange={e => updatePrescription(idx, 'durationDays', parseInt(e.target.value))}
                    className="w-20 px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                  />
                  <span className="text-xs text-gray-500">days</span>
                </div>
                {prescriptions.length > 1 && (
                  <button onClick={() => removeMedicine(idx)}
                    className="text-xs text-red-500 hover:text-red-700 text-right">
                    Remove
                  </button>
                )}
              </div>
              <input
                placeholder="Instructions (optional)"
                value={p.instructions}
                onChange={e => updatePrescription(idx, 'instructions', e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={saving}
        className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm
          hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? 'Saving...' : 'Save Medical Record'}
      </button>
    </div>
  );
};


// ─────────────────────────────────────────────────────────────
// App.jsx — Root router
// ─────────────────────────────────────────────────────────────

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage }           from './components/auth/LoginPage';
import { RegisterPage }        from './components/auth/RegisterPage';
import { PatientDashboard }    from './components/patient/PatientDashboard';
import { DoctorDashboard }     from './components/doctor/DoctorDashboard';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/unauthorized" replace />;
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"       element={<Navigate to="/login" replace />} />
          <Route path="/login"  element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/patient/*" element={
            <ProtectedRoute role="PATIENT">
              <PatientDashboard />
            </ProtectedRoute>
          } />
          <Route path="/doctor/*" element={
            <ProtectedRoute role="DOCTOR">
              <DoctorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/unauthorized" element={
            <div className="h-screen flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="text-6xl mb-4">🚫</div>
                <h1 className="text-2xl font-semibold mb-2">Access Denied</h1>
                <p>You don't have permission to access this page.</p>
              </div>
            </div>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
