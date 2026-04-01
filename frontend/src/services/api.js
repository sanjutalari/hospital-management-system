import { api } from '../context/AuthContext';

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

export const aiService = {
  analyze: (symptoms) => api.post('/ai/analyze', { symptoms }),
};

export const adminService = {
  getStats:   () => api.get('/admin/stats'),
  listUsers:  () => api.get('/admin/users'),
  toggleUser: (id) => api.patch(`/admin/users/${id}/toggle-active`),
};
