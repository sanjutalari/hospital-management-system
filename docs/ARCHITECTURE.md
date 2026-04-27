# 🏗️ Hospital Management System - Architecture Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Layers](#architecture-layers)
3. [Component Design](#component-design)
4. [Data Flow](#data-flow)
5. [Database Design](#database-design)
6. [API Design](#api-design)
7. [Real-Time Communication](#real-time-communication)
8. [Security Architecture](#security-architecture)
9. [Scalability Considerations](#scalability-considerations)

---

## System Overview

The Hospital Management System (HMS) is a full-stack web application that streamlines healthcare operations through patient management, appointment scheduling, medical records, prescriptions, real-time communication, and administrative analytics.

### Key Architectural Principles
- **Separation of Concerns:** Clear separation between frontend, backend, and database layers
- **Modularity:** Each feature is independently developed and integrated
- **Scalability:** Designed to handle growing user base and data volume
- **Security:** Multi-layered security approach for healthcare data
- **Real-Time Capability:** Socket.io for instant communication
- **Performance:** Optimized queries and efficient data handling

---

## Architecture Layers

### Three-Tier Architecture Model

```
┌──────────────────────────────────────────────────┐
│          PRESENTATION LAYER (Frontend)           │
│  React.js + TypeScript + Tailwind CSS + Socket  │
│                                                   │
│  ├─ User Interface Components                    │
│  ├─ State Management (Context API / Redux)      │
│  ├─ HTTP Client (Axios)                         │
│  ├─ WebSocket Client (Socket.io)                │
│  └─ Local Storage & Caching                     │
└──────────────────┬───────────────────────────────┘
                   │ HTTP REST + WebSocket
┌──────────────────▼───────────────────────────────┐
│          BUSINESS LOGIC LAYER (Backend)          │
│  Node.js + Express.js + Socket.io Server        │
│                                                   │
│  ├─ Route Handlers                              │
│  ├─ Controllers (Request Processing)            │
│  ├─ Services (Business Logic)                   │
│  ├─ Middleware (Authentication, Validation)     │
│  ├─ Socket Event Handlers                       │
│  └─ External API Integration                    │
└──────────────────┬───────────────────────────────┘
                   │ SQL Queries (Prisma ORM)
┌──────────────────▼───────────────────────────────┐
│         DATA ACCESS LAYER (Database)             │
│  PostgreSQL (Production) / SQLite (Dev)         │
│                                                   │
│  ├─ Users Table                                 │
│  ├─ Patients Table                              │
│  ├─ Doctors Table                               │
│  ├─ Appointments Table                          │
│  ├─ Medical Records Table                       │
│  ├─ Prescriptions Table                         │
│  ├─ Reports Table                               │
│  ├─ Chat Messages Table                         │
│  └─ Indexes & Constraints                       │
└──────────────────────────────────────────────────┘
```

---

## Component Design

### Frontend Components

#### Authentication Components
```
Authentication/
├── Login.jsx
│   ├─ Email/Password Input
│   ├─ JWT Token Storage
│   ├─ Role-based Redirect
│   └─ Error Handling
└── Register.jsx
    ├─ Form Validation
    ├─ Patient Code Auto-generation
    └─ Server Integration
```

#### Patient Dashboard
```
PatientDashboard/
├── AppointmentsList.jsx
│   ├─ Upcoming Appointments
│   ├─ Appointment History
│   └─ Cancel/Reschedule Options
├── MedicalRecords.jsx
│   ├─ View Records
│   ├─ Download Reports
│   └─ Upload Documents
├── Prescriptions.jsx
│   ├─ Active Prescriptions
│   └─ Prescription History
└── ChatInterface.jsx
    ├─ Real-time Messaging
    ├─ Message History
    └─ Doctor List
```

#### Doctor Portal
```
DoctorPortal/
├── AppointmentCalendar.jsx
│   ├─ Schedule View
│   ├─ Appointment Details
│   └─ Status Updates
├── PatientRecords.jsx
│   ├─ Medical History
│   ├─ Prescriptions
│   └─ Notes
└── MessagingInterface.jsx
    ├─ Patient Messages
    ├─ Message Notifications
    └─ Consultation Notes
```

#### Admin Dashboard
```
AdminDashboard/
├── Analytics.jsx
│   ├─ System Metrics
│   ├─ User Statistics
│   └─ Appointment Analytics
├── UserManagement.jsx
│   ├─ Add/Remove Users
│   ├─ Role Management
│   └─ Deactivate Accounts
└── SystemMonitoring.jsx
    ├─ Server Status
    ├─ Database Health
    └─ Performance Metrics
```

### Backend Components

#### Controllers (Request Handlers)
```
controllers/
├── auth.controller.js
│   ├─ register()      - Patient/Doctor registration
│   ├─ login()         - User authentication
│   ├─ logout()        - Session termination
│   ├─ refreshToken()  - Token refresh
│   └─ validateToken() - Token verification
│
├── patient.controller.js
│   ├─ getProfile()    - Retrieve patient data
│   ├─ updateProfile() - Update patient info
│   ├─ getRecords()    - Medical records
│   └─ deleteAccount() - Account removal
│
├── appointment.controller.js
│   ├─ bookAppointment()      - Create appointment
│   ├─ getAppointments()      - List appointments
│   ├─ updateAppointment()    - Status updates
│   ├─ cancelAppointment()    - Cancellation
│   ├─ checkConflicts()       - 30-min buffer check
│   └─ getAvailability()      - Doctor availability
│
└── ... (other controllers)
```

#### Services (Business Logic)
```
services/
├── auth.service.js
│   ├─ Password hashing (bcryptjs)
│   ├─ JWT generation
│   ├─ Token validation
│   └─ Role-based checks
│
├── appointment.service.js
│   ├─ Conflict detection algorithm
│   ├─ Availability calculation
│   ├─ Status transitions
│   └─ Notification triggers
│
├── notification.service.js
│   ├─ Email notifications
│   ├─ SMS alerts
│   ├─ In-app notifications
│   └─ Socket.io events
│
└── report.service.js
    ├─ Cloudinary upload
    ├─ File management
    └─ Access control
```

#### Middleware (Request Processing)
```
middleware/
├── auth.middleware.js
│   ├─ JWT verification
│   ├─ Token extraction
│   ├─ Expiry checking
│   └─ Role validation
│
├── errorHandler.js
│   ├─ Error catching
│   ├─ Error formatting
│   ├─ Logging
│   └─ Response generation
│
└── validation.middleware.js
    ├─ Input validation
    ├─ Schema checking
    ├─ Sanitization
    └─ Error reporting
```

---

## Data Flow

### Request Processing Flow

```
1. User Action (Frontend)
   │
   ├─ Form Submission / Button Click
   ├─ Data Collection & Validation
   └─ HTTP Request with JWT Token

2. Network Layer
   │
   ├─ Axios intercepts request
   ├─ Adds Authorization header
   └─ Sends to backend

3. Backend Receiving
   │
   ├─ Express receives request
   ├─ Routing to handler
   └─ Middleware chain execution

4. Authentication Layer
   │
   ├─ JWT Token extraction
   ├─ Token verification
   ├─ Role checking
   └─ User context setup

5. Validation Layer
   │
   ├─ Input schema validation
   ├─ Data sanitization
   └─ Business rule checks

6. Controller Processing
   │
   ├─ Parse request body
   ├─ Call service methods
   └─ Handle responses

7. Service/Business Logic
   │
   ├─ Execute business rules
   ├─ Database queries via Prisma
   └─ External API calls if needed

8. Database Operations
   │
   ├─ Prisma ORM translates to SQL
   ├─ Database executes query
   ├─ Transaction handling
   └─ Return results

9. Response Generation
   │
   ├─ Format response data
   ├─ Attach status codes
   └─ Send to client

10. Frontend Reception
    │
    ├─ Parse JSON response
    ├─ Update component state
    ├─ Re-render UI
    └─ Show feedback to user
```

### Real-Time Data Flow (Socket.io)

```
Event Trigger (Doctor/Patient action)
   │
   └─ Socket.emit('event_name', data)
      │
      └─ Network Layer (WebSocket)
         │
         └─ Backend Socket Handler
            │
            ├─ Event validation
            ├─ User authentication
            └─ Business logic execution
               │
               ├─ Database update (if needed)
               └─ Broadcast to room
                  │
                  └─ Socket.io broadcasts to clients
                     │
                     └─ Frontend receives via Socket.on()
                        │
                        └─ Update UI in real-time
```

---

## Database Design

### Entity Relationship Diagram (Conceptual)

```
          Users
           │
           ├─ 1:N ─ Patients
           │         │
           │         ├─ N:M ─ MedicalRecords ─ M:1 ─ Doctors
           │         │         │
           │         │         └─ 1:N ─ Prescriptions
           │         │
           │         └─ 1:N ─ Appointments ─ M:1 ─ Doctors
           │                   │
           │                   └─ 1:N ─ Reports
           │
           ├─ 1:N ─ Doctors
           │         │
           │         └─ 1:N ─ Appointments
           │
           └─ 1:N ─ ChatMessages (as sender/receiver)
```

### Key Database Features

#### Auto-Incrementing Codes
```sql
-- Patient Code Generation
SELECT COUNT(*) + 1 as next_number
FROM patients
-- Result: PAT-0001, PAT-0002, etc.

-- Doctor Code Generation
SELECT COUNT(*) + 1 as next_number
FROM doctors
-- Result: DOC-0001, DOC-0002, etc.
```

#### Conflict Detection Query
```sql
-- Check 30-minute appointment buffer
SELECT COUNT(*) FROM appointments
WHERE doctor_id = $1
AND appointment_date BETWEEN ($2 - interval '30 minutes') 
                       AND ($2 + interval '30 minutes')
AND status != 'CANCELLED'
-- Result: 0 if no conflicts
```

#### Indexes for Performance
```sql
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_patient_user ON patients(user_id);
CREATE INDEX idx_doctor_user ON doctors(user_id);
CREATE INDEX idx_appointment_date ON appointments(appointment_date);
CREATE INDEX idx_appointment_doctor ON appointments(doctor_id);
CREATE INDEX idx_appointment_patient ON appointments(patient_id);
CREATE INDEX idx_chat_sender ON chat_messages(sender_id);
CREATE INDEX idx_chat_receiver ON chat_messages(receiver_id);
```

---

## API Design

### RESTful Principles

#### Resource Organization
```
/api/auth              - Authentication
/api/patients          - Patient management
/api/doctors           - Doctor management
/api/appointments      - Appointment scheduling
/api/medical-records   - Medical records
/api/prescriptions     - Prescriptions
/api/reports           - Report management
/api/chat              - Messaging
/api/admin             - Admin operations
```

#### HTTP Methods
```
GET    - Retrieve data
POST   - Create new resource
PUT    - Update entire resource
PATCH  - Partial update
DELETE - Remove resource
```

#### Response Format
```json
Success Response (200):
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}

Error Response (4xx/5xx):
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": { ... }
  }
}

Paginated Response:
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "total": 100,
    "limit": 10,
    "offset": 0,
    "pages": 10
  }
}
```

---

## Real-Time Communication

### Socket.io Architecture

```
┌─────────────────┐
│ Socket.io Client│
│   (Frontend)    │
└────────┬────────┘
         │
    WebSocket
         │
┌────────▼────────────────────┐
│  Socket.io Server           │
│  (Backend)                  │
│                             │
│  ├─ Connection Handler      │
│  ├─ Event Listeners         │
│  ├─ Room Management         │
│  └─ Broadcasting            │
└────────┬────────────────────┘
         │
    ┌────┴────┬────────┬────────┐
    │          │        │        │
 Room:      Room:   Room:   Broadcast
Doctor-01 Patient Chat   All Users
```

### Socket Events

#### Doctor Room Events
```javascript
// Doctor joins room for notifications
socket.emit('join_doctor_room', { doctorId: 'uuid' });

// Backend broadcasts appointment updates to doctor
socket.broadcast.to(`doctor_${doctorId}`).emit('appointment_update', {
  appointmentId: 'uuid',
  patientName: 'John Doe',
  status: 'SCHEDULED',
  time: '2024-05-15T10:00:00Z'
});
```

#### Messaging Events
```javascript
// Patient sends message to doctor
socket.emit('send_message', {
  receiverId: 'uuid',
  message: 'Hello doctor, I have a question',
  timestamp: new Date()
});

// Doctor receives message
socket.on('receive_message', (data) => {
  // Update chat UI
  updateChatHistory(data);
});
```

#### Notification Events
```javascript
// Real-time appointment confirmation
socket.emit('appointment_confirmed', {
  appointmentId: 'uuid',
  status: 'CONFIRMED'
});

// Status changes broadcast
socket.broadcast.emit('status_update', {
  type: 'appointment',
  id: 'uuid',
  newStatus: 'COMPLETED'
});
```

---

## Security Architecture

### Authentication Flow

```
1. User Login
   ├─ Email & Password submission
   └─ Server validates credentials

2. Password Verification
   ├─ Retrieve hashed password from DB
   ├─ bcryptjs.compare() against input
   └─ Generate JWT if valid

3. JWT Token Generation
   ├─ Create payload with user data
   ├─ Sign with JWT_SECRET
   ├─ Two tokens: Access (15m) + Refresh (7d)
   └─ Send to client

4. Token Storage (Client)
   ├─ Access Token → Memory or httpOnly Cookie
   ├─ Refresh Token → httpOnly Cookie (secure)
   └─ Auto-refresh on expiry

5. Request Authentication
   ├─ Include JWT in Authorization header
   ├─ Backend verifies signature
   ├─ Validate token expiry
   └─ Extract user context

6. Authorization Check
   ├─ Check user role
   ├─ Verify resource access
   ├─ Apply RBAC rules
   └─ Allow/Deny request
```

### Password Security
```
Input Password → bcryptjs.hash(password, 12)
                 ├─ Salt rounds: 12
                 └─ Hash with salt → Stored in DB

Login: bcryptjs.compare(inputPassword, storedHash)
       ├─ Compare against stored hash
       └─ Constant-time comparison (prevent timing attacks)
```

### Security Headers (Helmet.js)
```
Content-Security-Policy: Prevent XSS attacks
X-Frame-Options: Prevent clickjacking
X-Content-Type-Options: Prevent MIME type sniffing
Strict-Transport-Security: Force HTTPS
Access-Control-Allow-Origin: CORS restriction
```

### Input Validation & Sanitization
```
1. Schema Validation (Joi/Yup)
   ├─ Email format
   ├─ Password strength
   ├─ Phone number format
   └─ Field presence

2. Input Sanitization
   ├─ Remove HTML tags
   ├─ Escape special characters
   ├─ Trim whitespace
   └─ Type coercion

3. Rate Limiting
   ├─ Max requests per IP
   ├─ Request timeout
   ├─ Burst protection
   └─ DDoS mitigation
```

---

## Scalability Considerations

### Database Optimization
```
1. Indexing Strategy
   ├─ Primary Keys (automatic)
   ├─ Foreign Keys
   ├─ Date range queries
   └─ Email uniqueness

2. Query Optimization
   ├─ Use Prisma select() for specific fields
   ├─ Pagination for large datasets
   ├─ Connection pooling
   └─ Query caching

3. Partitioning (Future)
   ├─ Time-based partitioning for messages
   ├─ User-based partitioning for appointments
   └─ Archive old records
```

### Load Balancing
```
                    ┌─────────────┐
                    │  Load       │
                    │ Balancer    │
                    └─────┬───────┘
                          │
              ┌───────────┼───────────┐
              │           │           │
         ┌────▼──┐   ┌────▼──┐   ┌──▼─────┐
         │Server │   │Server │   │ Server │
         │  1    │   │  2    │   │   3    │
         └────┬──┘   └────┬──┘   └──┬─────┘
              │           │           │
              └───────────┼───────────┘
                          │
                    ┌─────▼─────┐
                    │ Database  │
                    │ Cluster   │
                    └───────────┘
```

### Caching Strategy
```
1. Client-Side
   ├─ localStorage for tokens
   ├─ sessionStorage for temporary data
   └─ IndexedDB for offline data

2. Server-Side
   ├─ Redis for session management
   ├─ Response caching for GET requests
   ├─ Query result caching
   └─ CDN for static assets

3. Database Query Cache
   ├─ Prepared statements
   ├─ Query result sets
   └─ Connection pooling
```

### Horizontal Scaling
```
1. Stateless Backend
   ├─ No server-side sessions
   ├─ JWT-based authentication
   ├─ Any server can handle any request
   └─ Easy auto-scaling

2. Database Replication
   ├─ Master-Slave setup
   ├─ Read replicas for queries
   ├─ Write operations to master
   └─ Data consistency

3. Message Queue (Future)
   ├─ RabbitMQ/Kafka for async operations
   ├─ Email sending queue
   ├─ Notification queue
   └─ Report generation queue
```

---

## Deployment Architecture

### Production Setup
```
                    ┌──────────┐
                    │  Domain  │
                    │ (HTTPS)  │
                    └─────┬────┘
                          │
                    ┌─────▼────┐
                    │   CDN    │
                    │(Static)  │
                    └─────┬────┘
                          │
                    ┌─────▼────────────┐
                    │  Load Balancer   │
                    │(NGinx/HAProxy)   │
                    └─────┬────────────┘
                          │
            ┌─────────────┼─────────────┐
            │             │             │
       ┌────▼──┐      ┌────▼──┐     ┌──▼─────┐
       │  Node │      │  Node │     │  Node  │
       │  App1 │      │  App2 │     │  App3  │
       └────┬──┘      └────┬──┘     └──┬─────┘
            │             │             │
            └─────────────┼─────────────┘
                          │
                ┌─────────▼──────────┐
                │ PostgreSQL Master  │
                └──────────┬─────────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
         ┌────▼──┐    ┌────▼──┐   ┌───▼────┐
         │Replica│    │Replica│   │Replica │
         │  DB1  │    │  DB2  │   │  DB3   │
         └───────┘    └───────┘   └────────┘
```

---

## Monitoring & Logging

### Application Logging
```javascript
// Winston Logger Configuration
{
  level: 'info',
  format: 'json',
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
}
```

### Performance Monitoring
```
1. API Response Time
   ├─ Log every request duration
   ├─ Alert if > 2 seconds
   └─ Track by endpoint

2. Database Performance
   ├─ Query execution time
   ├─ Connection pool status
   └─ Slow query log

3. System Resources
   ├─ CPU usage
   ├─ Memory usage
   ├─ Disk usage
   └─ Network I/O
```

---

## Future Enhancements

1. **Microservices Architecture** - Split into independent services
2. **GraphQL API** - Alternative to REST for flexible queries
3. **Machine Learning** - Appointment recommendations, diagnosis assistance
4. **Mobile App** - React Native for iOS/Android
5. **Advanced Analytics** - BI dashboards with predictive analytics
6. **Video Consultations** - WebRTC integration for telemedicine
7. **Multi-tenant Support** - Multiple hospital support
8. **AI Chatbot** - Automated patient inquiries handling

---

**Last Updated:** April 27, 2026
**Version:** 1.0.0

