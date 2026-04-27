# 📡 API Documentation - Hospital Management System

## Base URL
```
Production: https://api.hospitalmanagementsystem.com/api
Development: http://localhost:5000/api
```

## Authentication
All endpoints (except `/auth/register` and `/auth/login`) require JWT authentication:

```bash
Authorization: Bearer <accessToken>
```

---

## Table of Contents
1. [Authentication](#authentication)
2. [Patient Management](#patient-management)
3. [Doctor Management](#doctor-management)
4. [Appointments](#appointments)
5. [Medical Records](#medical-records)
6. [Prescriptions](#prescriptions)
7. [Reports](#reports)
8. [Chat/Messaging](#chatmessaging)
9. [Admin](#admin)

---

## Authentication

### 1. Register Patient

**Endpoint:** `POST /auth/register`

**Public:** ✅ Yes (No authentication required)

**Request:**
```json
{
  "email": "patient@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1990-01-15",
  "gender": "M",
  "bloodGroup": "O+",
  "address": "123 Main Street, City",
  "phoneNumber": "+1234567890",
  "emergencyContact": "+9876543210"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Patient registered successfully",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "patient@example.com",
      "role": "PATIENT"
    },
    "patient": {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "code": "PAT-0001",
      "firstName": "John",
      "lastName": "Doe",
      "dateOfBirth": "1990-01-15"
    }
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
- `400 Bad Request` - Invalid input
- `409 Conflict` - Email already registered

---

### 2. Register Doctor

**Endpoint:** `POST /auth/register-doctor`

**Public:** ❌ No (Admin only)

**Request:**
```json
{
  "email": "doctor@example.com",
  "password": "SecurePassword123!",
  "firstName": "Jane",
  "lastName": "Smith",
  "specialization": "Cardiologist",
  "licenseNumber": "MD123456",
  "qualifications": "MBBS, MD (Cardiology)",
  "experience": 10,
  "consultationFee": 500
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Doctor registered successfully",
  "data": {
    "user": {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "email": "doctor@example.com",
      "role": "DOCTOR"
    },
    "doctor": {
      "id": "880e8400-e29b-41d4-a716-446655440003",
      "code": "DOC-0001",
      "specialization": "Cardiologist"
    }
  },
  "accessToken": "...",
  "refreshToken": "..."
}
```

---

### 3. Login

**Endpoint:** `POST /auth/login`

**Public:** ✅ Yes

**Request:**
```json
{
  "email": "patient@example.com",
  "password": "SecurePassword123!"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "patient@example.com",
      "role": "PATIENT",
      "firstName": "John",
      "lastName": "Doe"
    }
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
- `401 Unauthorized` - Invalid credentials
- `404 Not Found` - User not found

---

### 4. Refresh Token

**Endpoint:** `POST /auth/refresh`

**Public:** ❌ No

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 5. Logout

**Endpoint:** `POST /auth/logout`

**Public:** ❌ No

**Request:** (Empty body)

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Patient Management

### 1. Get Patient Profile

**Endpoint:** `GET /patients/:id`

**Authorization:** Required (Patient can view own, Doctor/Admin can view assigned/all)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "code": "PAT-0001",
    "firstName": "John",
    "lastName": "Doe",
    "email": "patient@example.com",
    "dateOfBirth": "1990-01-15",
    "gender": "M",
    "bloodGroup": "O+",
    "address": "123 Main Street",
    "phoneNumber": "+1234567890",
    "emergencyContact": "+9876543210",
    "medicalHistory": "Hypertension, Diabetes",
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
}
```

---

### 2. Update Patient Profile

**Endpoint:** `PUT /patients/:id`

**Authorization:** Required (Patient own or Admin)

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "address": "456 New Street",
  "phoneNumber": "+1234567890",
  "medicalHistory": "Updated medical history"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": { ... }
}
```

---

### 3. Get All Patients

**Endpoint:** `GET /patients?limit=10&offset=0`

**Authorization:** Required (Admin/Doctor)

**Query Parameters:**
- `limit` (integer) - Records per page (default: 10)
- `offset` (integer) - Starting record (default: 0)
- `search` (string) - Search by name or email

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "total": 150,
    "limit": 10,
    "offset": 0,
    "pages": 15
  }
}
```

---

### 4. Delete Patient Account

**Endpoint:** `DELETE /patients/:id`

**Authorization:** Required (Patient own or Admin)

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

---

## Doctor Management

### 1. Get Doctor Profile

**Endpoint:** `GET /doctors/:id`

**Authorization:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "880e8400-e29b-41d4-a716-446655440003",
    "code": "DOC-0001",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "doctor@example.com",
    "specialization": "Cardiologist",
    "licenseNumber": "MD123456",
    "qualifications": "MBBS, MD (Cardiology)",
    "experience": 10,
    "consultationFee": 500,
    "availability": {
      "Monday": "09:00-17:00",
      "Tuesday": "09:00-17:00",
      "Wednesday": "09:00-14:00"
    },
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

---

### 2. Update Doctor Profile

**Endpoint:** `PUT /doctors/:id`

**Authorization:** Required (Doctor own or Admin)

**Request:**
```json
{
  "specialization": "Cardiologist",
  "consultationFee": 550,
  "availability": {
    "Monday": "09:00-17:00",
    "Tuesday": "09:00-17:00"
  }
}
```

**Response:** `200 OK`

---

### 3. Get All Doctors

**Endpoint:** `GET /doctors?specialization=Cardiologist&limit=10&offset=0`

**Authorization:** Required

**Query Parameters:**
- `specialization` (string) - Filter by specialization
- `limit` (integer) - Records per page
- `offset` (integer) - Starting record

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": { ... }
}
```

---

### 4. Get Doctor Availability

**Endpoint:** `GET /doctors/:id/availability?date=2024-05-15`

**Authorization:** Required

**Query Parameters:**
- `date` (ISO 8601) - Specific date to check availability

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "doctorId": "880e8400-e29b-41d4-a716-446655440003",
    "date": "2024-05-15",
    "availableSlots": [
      "09:00", "09:30", "10:00", "10:30", "11:00",
      "14:00", "14:30", "15:00"
    ]
  }
}
```

---

## Appointments

### 1. Book Appointment

**Endpoint:** `POST /appointments/book`

**Authorization:** Required (Patient)

**Request:**
```json
{
  "doctorId": "880e8400-e29b-41d4-a716-446655440003",
  "appointmentDate": "2024-05-15T10:00:00Z",
  "reason": "Regular checkup and heart examination",
  "notes": "I have chest pain occasionally"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Appointment booked successfully",
  "data": {
    "id": "990e8400-e29b-41d4-a716-446655440004",
    "patientId": "660e8400-e29b-41d4-a716-446655440001",
    "doctorId": "880e8400-e29b-41d4-a716-446655440003",
    "appointmentDate": "2024-05-15T10:00:00Z",
    "status": "SCHEDULED",
    "reason": "Regular checkup and heart examination",
    "notes": "I have chest pain occasionally",
    "createdAt": "2024-05-10T15:30:00Z"
  }
}
```

**Errors:**
- `409 Conflict` - Time slot already booked (within 30-minute buffer)
- `400 Bad Request` - Invalid date/time

---

### 2. Get Patient Appointments

**Endpoint:** `GET /appointments/patient?status=SCHEDULED&limit=10&offset=0`

**Authorization:** Required (Patient own)

**Query Parameters:**
- `status` (SCHEDULED|COMPLETED|CANCELLED) - Filter by status
- `limit` (integer) - Records per page
- `offset` (integer) - Starting record

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "990e8400-e29b-41d4-a716-446655440004",
      "doctorId": "880e8400-e29b-41d4-a716-446655440003",
      "doctorName": "Jane Smith",
      "specialization": "Cardiologist",
      "appointmentDate": "2024-05-15T10:00:00Z",
      "status": "SCHEDULED",
      "reason": "Regular checkup"
    }
  ],
  "pagination": { ... }
}
```

---

### 3. Get Doctor Appointments

**Endpoint:** `GET /appointments/doctor?date=2024-05-15&limit=20&offset=0`

**Authorization:** Required (Doctor own)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "990e8400-e29b-41d4-a716-446655440004",
      "patientId": "660e8400-e29b-41d4-a716-446655440001",
      "patientName": "John Doe",
      "appointmentDate": "2024-05-15T10:00:00Z",
      "status": "SCHEDULED",
      "reason": "Regular checkup"
    }
  ],
  "pagination": { ... }
}
```

---

### 4. Update Appointment Status

**Endpoint:** `PATCH /appointments/:id/status`

**Authorization:** Required (Doctor/Admin)

**Request:**
```json
{
  "status": "COMPLETED",
  "notes": "Patient responded well to treatment"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Appointment status updated",
  "data": { ... }
}
```

---

### 5. Cancel Appointment

**Endpoint:** `DELETE /appointments/:id`

**Authorization:** Required (Patient/Doctor/Admin)

**Request:**
```json
{
  "reason": "Unable to attend due to emergency"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Appointment cancelled successfully"
}
```

---

## Medical Records

### 1. Get Patient Medical Records

**Endpoint:** `GET /medical-records/patient/:patientId?limit=10&offset=0`

**Authorization:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "aa0e8400-e29b-41d4-a716-446655440005",
      "patientId": "660e8400-e29b-41d4-a716-446655440001",
      "appointmentId": "990e8400-e29b-41d4-a716-446655440004",
      "diagnosis": "Hypertension (Stage 1)",
      "treatment": "Prescribed Lisinopril 10mg daily",
      "observations": "BP: 140/90, Pulse: 78",
      "doctorName": "Jane Smith",
      "createdAt": "2024-05-15T10:30:00Z"
    }
  ],
  "pagination": { ... }
}
```

---

### 2. Create Medical Record

**Endpoint:** `POST /medical-records`

**Authorization:** Required (Doctor)

**Request:**
```json
{
  "patientId": "660e8400-e29b-41d4-a716-446655440001",
  "appointmentId": "990e8400-e29b-41d4-a716-446655440004",
  "diagnosis": "Hypertension (Stage 1)",
  "treatment": "Prescribed Lisinopril 10mg daily",
  "observations": "BP: 140/90, Pulse: 78, Weight: 75kg"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Medical record created",
  "data": { ... }
}
```

---

## Prescriptions

### 1. Get Patient Prescriptions

**Endpoint:** `GET /prescriptions/patient/:patientId?limit=10&offset=0`

**Authorization:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "bb0e8400-e29b-41d4-a716-446655440006",
      "patientId": "660e8400-e29b-41d4-a716-446655440001",
      "medicationName": "Lisinopril",
      "dosage": "10mg",
      "frequency": "Once daily",
      "duration": "30 days",
      "instructions": "Take in the morning with or without food",
      "doctorName": "Jane Smith",
      "createdAt": "2024-05-15T10:30:00Z"
    }
  ],
  "pagination": { ... }
}
```

---

### 2. Create Prescription

**Endpoint:** `POST /prescriptions`

**Authorization:** Required (Doctor)

**Request:**
```json
{
  "patientId": "660e8400-e29b-41d4-a716-446655440001",
  "medicalRecordId": "aa0e8400-e29b-41d4-a716-446655440005",
  "medicationName": "Lisinopril",
  "dosage": "10mg",
  "frequency": "Once daily",
  "duration": "30 days",
  "instructions": "Take in the morning with or without food"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Prescription created",
  "data": { ... }
}
```

---

## Reports

### 1. Upload Medical Report

**Endpoint:** `POST /reports/upload`

**Authorization:** Required (Patient/Doctor)

**Content-Type:** multipart/form-data

**Fields:**
- `patientId` (string) - Patient ID
- `reportType` (string) - Type: X-Ray, CT Scan, Blood Test, etc.
- `file` (file) - PDF/Image file (max 10MB)

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Report uploaded successfully",
  "data": {
    "id": "cc0e8400-e29b-41d4-a716-446655440007",
    "patientId": "660e8400-e29b-41d4-a716-446655440001",
    "reportType": "X-Ray",
    "fileName": "chest_xray_2024.pdf",
    "fileUrl": "https://cdn.example.com/reports/chest_xray_2024.pdf",
    "uploadedAt": "2024-05-15T14:00:00Z"
  }
}
```

---

### 2. Get Patient Reports

**Endpoint:** `GET /reports/patient/:patientId?limit=10&offset=0`

**Authorization:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "cc0e8400-e29b-41d4-a716-446655440007",
      "patientId": "660e8400-e29b-41d4-a716-446655440001",
      "reportType": "X-Ray",
      "fileName": "chest_xray_2024.pdf",
      "fileUrl": "https://cdn.example.com/reports/chest_xray_2024.pdf",
      "uploadedAt": "2024-05-15T14:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

---

### 3. Download Report

**Endpoint:** `GET /reports/:id/download`

**Authorization:** Required

**Response:** `200 OK` (File download)

---

## Chat/Messaging

### 1. Send Message

**Endpoint:** `POST /chat/send`

**Authorization:** Required

**Request:**
```json
{
  "receiverId": "880e8400-e29b-41d4-a716-446655440003",
  "message": "Hello doctor, I have a question about my medication"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "id": "dd0e8400-e29b-41d4-a716-446655440008",
    "senderId": "660e8400-e29b-41d4-a716-446655440001",
    "receiverId": "880e8400-e29b-41d4-a716-446655440003",
    "message": "Hello doctor, I have a question about my medication",
    "isRead": false,
    "createdAt": "2024-05-15T15:00:00Z"
  }
}
```

---

### 2. Get Chat History

**Endpoint:** `GET /chat/history/:userId?limit=50&offset=0`

**Authorization:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "dd0e8400-e29b-41d4-a716-446655440008",
      "senderId": "660e8400-e29b-41d4-a716-446655440001",
      "senderName": "John Doe",
      "receiverId": "880e8400-e29b-41d4-a716-446655440003",
      "message": "Hello doctor...",
      "isRead": true,
      "createdAt": "2024-05-15T15:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

---

### 3. Mark Message as Read

**Endpoint:** `PATCH /chat/:messageId/read`

**Authorization:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Message marked as read"
}
```

---

## Admin

### 1. Get System Analytics

**Endpoint:** `GET /admin/analytics?period=monthly`

**Authorization:** Required (Admin)

**Query Parameters:**
- `period` (daily|weekly|monthly|yearly)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "totalUsers": 1250,
    "totalPatients": 800,
    "totalDoctors": 150,
    "totalAppointments": 5000,
    "completedAppointments": 4200,
    "cancelledAppointments": 300,
    "activeUsers": 450,
    "newUsersThisMonth": 125,
    "appointmentCompletionRate": 84
  }
}
```

---

### 2. Get System Health

**Endpoint:** `GET /admin/health`

**Authorization:** Required (Admin)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "databaseStatus": "Connected",
    "databaseResponseTime": "15ms",
    "serverUptime": "45 days",
    "apiResponseTime": "245ms",
    "activeConnections": 234,
    "totalRequests": 1000000,
    "errorRate": 0.5,
    "cacheStatus": "Active"
  }
}
```

---

### 3. Get User Activity Logs

**Endpoint:** `GET /admin/logs?type=login&limit=100&offset=0`

**Authorization:** Required (Admin)

**Query Parameters:**
- `type` (login|create|update|delete|error)
- `limit`, `offset` for pagination

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "ee0e8400-e29b-41d4-a716-446655440009",
      "userId": "660e8400-e29b-41d4-a716-446655440001",
      "userName": "John Doe",
      "action": "login",
      "details": "Logged in from 192.168.1.1",
      "timestamp": "2024-05-15T15:30:00Z"
    }
  ],
  "pagination": { ... }
}
```

---

## Error Handling

### Common Error Codes

```
400 Bad Request
- Invalid request format
- Missing required fields
- Invalid data types

401 Unauthorized
- Missing authentication token
- Invalid token
- Token expired

403 Forbidden
- Insufficient permissions
- Role-based access denied

404 Not Found
- Resource not found
- Invalid ID

409 Conflict
- Duplicate entry
- Appointment conflict

429 Too Many Requests
- Rate limit exceeded

500 Internal Server Error
- Server-side error
- Database connection error
```

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "APPOINTMENT_CONFLICT",
    "message": "Appointment time slot already booked",
    "details": {
      "requestedTime": "2024-05-15T10:00:00Z",
      "conflict": "Another appointment exists within 30 minutes"
    }
  }
}
```

---

## Rate Limiting

- **Default Limit:** 100 requests per minute per IP
- **Headers:** `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- **Auth Endpoints:** 5 attempts per 15 minutes per email

---

## Pagination

All list endpoints support pagination:

```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "total": 500,
    "limit": 10,
    "offset": 0,
    "pages": 50,
    "hasMore": true
  }
}
```

---

**Last Updated:** April 27, 2026
**Version:** 1.0.0
**API Status:** ✅ Active

