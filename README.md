# 🏥 Hospital Management System (HMS)

[![Node.js](https://img.shields.io/badge/Node.js-v18+-brightgreen)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v18+-blue)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)]()

A comprehensive, full-stack hospital management system built with modern web technologies. Designed to streamline healthcare operations including patient management, appointment scheduling, medical records, prescriptions, real-time communication, and administrative dashboards.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [Real-Time Features](#real-time-features)
- [Testing](#testing)
- [Security](#security)
- [Performance](#performance)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Team](#team)
- [Support](#support)

---

## ✨ Features

### Core Features
- **Patient Management** - Register, update, and manage patient profiles with auto-generated patient codes (PAT-0001, etc.)
- **Doctor Management** - Manage doctor profiles, specializations, and availability with auto-generated doctor codes (DOC-0001, etc.)
- **Appointment Scheduling** - Book appointments with intelligent conflict detection (30-minute buffer)
- **Medical Records** - Centralized storage of patient medical history and clinical documentation
- **Prescription Management** - Issue, track, and manage patient prescriptions
- **Real-Time Messaging** - Secure, instant communication between patients and doctors using Socket.io
- **Report Management** - Upload, store, and retrieve medical reports with cloud storage (Cloudinary)
- **Admin Dashboard** - Analytics, system monitoring, and administrative controls

### Security Features
- JWT-based authentication (15-minute access tokens, 7-day refresh tokens)
- Bcryptjs password hashing (12-round salting)
- Role-based access control (RBAC) - Patient, Doctor, Admin roles
- CORS protection and security headers (Helmet.js)
- Rate limiting to prevent abuse
- Secure session management

### Performance Features
- Response time: < 2 seconds for all API endpoints
- Database query optimization: < 50 milliseconds
- Real-time message delivery: < 500 milliseconds
- Support for 500+ concurrent connections
- Vertical transaction throughput: 500+ operations/second

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React.js | 18+ | UI Framework |
| TypeScript | 5+ | Type Safety |
| Axios | 1.6+ | HTTP Client |
| React Router | 6+ | Navigation |
| Tailwind CSS | 3+ | Styling |
| Socket.io Client | 4.7.5 | Real-time Communication |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | Runtime |
| Express.js | 4.19.2 | Web Framework |
| Prisma | 5.14.0 | ORM |
| Socket.io | 4.7.5 | Real-time Events |
| JWT | 9.0.2 | Authentication |
| bcryptjs | 2.4.3 | Password Hashing |

### Database
| Technology | Version | Purpose |
|------------|---------|---------|
| PostgreSQL | 14+ | Production Database |
| SQLite | 3+ | Development Database |
| Prisma Schema | 5.14.0 | ORM Schema |

### DevOps & Tools
| Technology | Version | Purpose |
|------------|---------|---------|
| Docker | Latest | Containerization |
| Cloudinary | 2.3.1 | Cloud Storage |
| Helmet | 7.1.0 | Security Headers |
| Morgan | 1.10.1 | HTTP Logging |
| Winston | 3.19.0 | Application Logging |
| Multer | 1.4.5 | File Upload |

---

## 🏗️ System Architecture

### Three-Tier Architecture

```
┌─────────────────────────────────────────┐
│         CLIENT LAYER (Frontend)         │
│  React.js + TypeScript + Tailwind CSS   │
│  ├─ Patient Dashboard                   │
│  ├─ Doctor Portal                       │
│  ├─ Admin Console                       │
│  └─ Real-time Chat Interface            │
└────────────────┬────────────────────────┘
                 │ HTTP/WebSocket
┌────────────────▼────────────────────────┐
│       BUSINESS LOGIC LAYER (Backend)    │
│   Node.js + Express.js + Socket.io      │
│  ├─ Authentication Service              │
│  ├─ Appointment Service                 │
│  ├─ Patient Service                     │
│  ├─ Medical Records Service             │
│  ├─ Real-time Messaging Service         │
│  └─ Report Management Service           │
└────────────────┬────────────────────────┘
                 │ SQL
┌────────────────▼────────────────────────┐
│      DATA ACCESS LAYER (Database)       │
│   PostgreSQL (Prod) / SQLite (Dev)      │
│  ├─ Users Table                         │
│  ├─ Patients Table                      │
│  ├─ Doctors Table                       │
│  ├─ Appointments Table                  │
│  ├─ Medical Records Table               │
│  ├─ Prescriptions Table                 │
│  ├─ Reports Table                       │
│  └─ Chat Messages Table                 │
└─────────────────────────────────────────┘
```

### Data Flow

```
User Action → Frontend (React) → API Request → Express Router 
→ Controller → Service → Prisma ORM → Database → Response 
→ Frontend (Update UI) → User Sees Change
```

### Real-Time Flow (Socket.io)

```
Event from Client → Socket.io Server → Process Event 
→ Broadcast to Relevant Rooms → Update Connected Clients
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- PostgreSQL 14 or higher (or SQLite for development)
- npm or yarn package manager
- Git

### Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/sanjutalari/hospital-management-system.git
cd hospital-management-system
```

#### 2. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

#### 3. Environment Configuration

**Backend (.env file):**
```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/hms_db"
# For development: DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=development

# Cloudinary (optional, for cloud storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS
CORS_ORIGIN=http://localhost:3000
```

**Frontend (.env file):**
```bash
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

#### 4. Database Setup

**Initialize Prisma:**
```bash
cd backend
npx prisma migrate dev --name init
npx prisma db seed  # (optional, if seed script exists)
```

#### 5. Run the Application

**Backend (Terminal 1):**
```bash
cd backend
npm start
# Server running on http://localhost:5000
```

**Frontend (Terminal 2):**
```bash
cd frontend
npm start
# App running on http://localhost:3000
```

#### 6. Access the Application
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api
- **Socket.io:** ws://localhost:5000

---

## 📁 Project Structure

```
hospital-management-system/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.js          # Authentication logic
│   │   │   ├── patient.controller.js       # Patient management
│   │   │   ├── doctor.controller.js        # Doctor management
│   │   │   ├── appointment.controller.js   # Appointment booking
│   │   │   ├── medical-record.controller.js
│   │   │   ├── prescription.controller.js
│   │   │   ├── report.controller.js        # File management
│   │   │   ├── chat.controller.js          # Messaging
│   │   │   └── admin.controller.js         # Analytics
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── patient.routes.js
│   │   │   ├── doctor.routes.js
│   │   │   ├── appointment.routes.js
│   │   │   ├── medical-record.routes.js
│   │   │   ├── prescription.routes.js
│   │   │   ├── report.routes.js
│   │   │   ├── chat.routes.js
│   │   │   └── admin.routes.js
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js          # JWT verification
│   │   │   ├── errorHandler.js
│   │   │   └── validationHandler.js
│   │   ├── services/
│   │   │   ├── auth.service.js
│   │   │   ├── appointment.service.js
│   │   │   ├── report.service.js
│   │   │   └── notification.service.js
│   │   ├── utils/
│   │   │   ├── logger.js                   # Winston logging
│   │   │   ├── cloudinary.js
│   │   │   └── validators.js
│   │   ├── socket/
│   │   │   └── socketHandler.js            # Socket.io events
│   │   └── server.js                       # Express app entry
│   ├── schema.prisma                       # Database schema (ORM)
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   └── Register.jsx
│   │   │   ├── Dashboard/
│   │   │   ├── Appointments/
│   │   │   ├── MedicalRecords/
│   │   │   ├── Prescriptions/
│   │   │   ├── Chat/
│   │   │   └── Admin/
│   │   ├── pages/
│   │   ├── services/
│   │   │   ├── api.js                      # Axios instance
│   │   │   └── socket.js                   # Socket.io client
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── index.js
│   ├── package.json
│   ├── tailwind.config.js
│   ├── .env.example
│   └── README.md
│
├── docs/
│   ├── API_DOCUMENTATION.md               # API endpoints
│   ├── ARCHITECTURE.md                    # System design
│   ├── SETUP.md                           # Installation guide
│   ├── TESTING.md                         # Test procedures
│   ├── DATABASE_SCHEMA.md                 # ER diagram
│   └── DEPLOYMENT.md                      # Production deployment
│
├── .gitignore
├── README.md (this file)
└── CONTRIBUTING.md
```

---

## 🗄️ Database Schema

### Core Tables

#### Users (Authentication Base)
```
Users
├── id: UUID (Primary Key)
├── email: String (Unique)
├── password: String (hashed with bcryptjs)
├── role: Enum (PATIENT, DOCTOR, ADMIN)
├── firstName: String
├── lastName: String
├── createdAt: DateTime
└── updatedAt: DateTime
```

#### Patients
```
Patients
├── id: UUID (Primary Key)
├── code: String (Auto-generated: PAT-0001, PAT-0002, etc.)
├── userId: UUID (Foreign Key → Users)
├── dateOfBirth: DateTime
├── gender: String
├── bloodGroup: String
├── address: String
├── phoneNumber: String
├── emergencyContact: String
├── medicalHistory: Text
├── createdAt: DateTime
└── updatedAt: DateTime
```

#### Doctors
```
Doctors
├── id: UUID (Primary Key)
├── code: String (Auto-generated: DOC-0001, DOC-0002, etc.)
├── userId: UUID (Foreign Key → Users)
├── specialization: String
├── licenseNumber: String
├── qualifications: String
├── experience: Integer
├── consultationFee: Decimal
├── availability: JSON
├── createdAt: DateTime
└── updatedAt: DateTime
```

#### Appointments
```
Appointments
├── id: UUID (Primary Key)
├── patientId: UUID (Foreign Key → Patients)
├── doctorId: UUID (Foreign Key → Doctors)
├── appointmentDate: DateTime
├── status: Enum (SCHEDULED, COMPLETED, CANCELLED)
├── reason: String
├── notes: Text
├── createdAt: DateTime
└── updatedAt: DateTime
```

#### Medical Records
```
MedicalRecords
├── id: UUID (Primary Key)
├── patientId: UUID (Foreign Key → Patients)
├── appointmentId: UUID (Foreign Key → Appointments)
├── diagnosis: String
├── treatment: String
├── observations: Text
├── createdAt: DateTime
└── updatedAt: DateTime
```

#### Prescriptions
```
Prescriptions
├── id: UUID (Primary Key)
├── patientId: UUID (Foreign Key → Patients)
├── medicalRecordId: UUID (Foreign Key → MedicalRecords)
├── medicationName: String
├── dosage: String
├── frequency: String
├── duration: String
├── instructions: Text
├── createdAt: DateTime
└── updatedAt: DateTime
```

#### Reports
```
Reports
├── id: UUID (Primary Key)
├── patientId: UUID (Foreign Key → Patients)
├── reportType: String
├── fileUrl: String
├── fileName: String
├── uploadedAt: DateTime
├── createdAt: DateTime
└── updatedAt: DateTime
```

#### Chat Messages
```
ChatMessages
├── id: UUID (Primary Key)
├── senderId: UUID (Foreign Key → Users)
├── receiverId: UUID (Foreign Key → Users)
├── message: Text
├── isRead: Boolean (default: false)
├── createdAt: DateTime
└── updatedAt: DateTime
```

---

## 📡 API Documentation

### Authentication Endpoints

#### Register (Patient)
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "patient@example.com",
  "password": "secure_password",
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1990-01-01",
  "gender": "M",
  "bloodGroup": "O+",
  "address": "123 Main St",
  "phoneNumber": "+1234567890"
}

Response: 201 Created
{
  "message": "Patient registered successfully",
  "patientCode": "PAT-0001",
  "user": { ... },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "patient@example.com",
  "password": "secure_password"
}

Response: 200 OK
{
  "message": "Login successful",
  "user": { ... },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

#### Refresh Token
```
POST /api/auth/refresh
Authorization: Bearer <refreshToken>

Response: 200 OK
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

### Patient Endpoints

#### Get Patient Profile
```
GET /api/patients/:id
Authorization: Bearer <accessToken>

Response: 200 OK
{
  "id": "uuid",
  "code": "PAT-0001",
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1990-01-01",
  "gender": "M",
  "bloodGroup": "O+",
  ...
}
```

#### Update Patient Profile
```
PUT /api/patients/:id
Authorization: Bearer <accessToken>
Content-Type: application/json

Response: 200 OK
```

### Appointment Endpoints

#### Book Appointment
```
POST /api/appointments/book
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "doctorId": "uuid",
  "appointmentDate": "2024-05-15T10:00:00Z",
  "reason": "Regular checkup"
}

Response: 201 Created
{
  "id": "uuid",
  "patientId": "uuid",
  "doctorId": "uuid",
  "appointmentDate": "2024-05-15T10:00:00Z",
  "status": "SCHEDULED",
  "reason": "Regular checkup"
}
```

#### Get Appointments
```
GET /api/appointments?status=SCHEDULED&limit=10&offset=0
Authorization: Bearer <accessToken>

Response: 200 OK
{
  "appointments": [ ... ],
  "total": 15,
  "limit": 10,
  "offset": 0
}
```

### Messaging Endpoints

#### Get Chat History
```
GET /api/chat/:otherUserId?limit=50&offset=0
Authorization: Bearer <accessToken>

Response: 200 OK
{
  "messages": [ ... ],
  "total": 150,
  "limit": 50,
  "offset": 0
}
```

---

## 🔄 Real-Time Features (Socket.io)

### Socket Events

#### Doctor Joins Room
```javascript
socket.emit('join_doctor_room', { doctorId: 'uuid' });
```

#### Send Message
```javascript
socket.emit('send_message', {
  receiverId: 'uuid',
  message: 'Hello doctor!'
});
```

#### Receive Message
```javascript
socket.on('receive_message', (data) => {
  console.log('New message:', data);
});
```

#### Appointment Notification
```javascript
socket.on('appointment_update', (data) => {
  // Handle appointment status change
});
```

---

## 🧪 Testing

### Test Coverage
- 24 comprehensive test cases
- Authentication tests (5)
- Patient management (3)
- Appointment scheduling (4)
- Real-time messaging (3)
- Medical records (3)
- Report management (3)
- Admin features (3)

### Run Tests
```bash
cd backend
npm test

# Run with coverage
npm run test:coverage

# Run specific test suite
npm test -- appointment.test.js
```

### Test Categories

1. **Authentication**
   - Patient registration with auto-generated codes
   - JWT token generation and validation
   - Password hashing and verification
   - Token refresh mechanism

2. **Appointment Management**
   - Conflict detection (30-minute buffer)
   - Status updates
   - Real-time notifications
   - Doctor availability

3. **Medical Records**
   - Create and retrieve records
   - Link to appointments
   - Data validation

4. **Real-Time Messaging**
   - Message delivery
   - Read status tracking
   - Chat history retrieval

---

## 🔒 Security

### Authentication & Authorization
- JWT tokens with 15-minute expiry for access
- Secure refresh token mechanism (7-day expiry)
- Bcryptjs password hashing with 12-round salting
- Role-based access control (RBAC)
- Password validation requirements

### Data Protection
- CORS enabled for authorized origins only
- Security headers via Helmet.js
- Rate limiting to prevent brute force attacks
- Input validation on all endpoints
- SQL injection prevention via Prisma ORM

### Compliance
- HIPAA considerations for healthcare data
- Secure password storage
- Audit logging of critical operations
- Session management

---

## 📊 Performance

### Benchmarks
- **API Response Time:** < 2 seconds (typical: 245-312 ms)
- **Database Query:** < 50 milliseconds
- **Real-Time Message Delivery:** < 500 milliseconds
- **Page Load Time:** < 3 seconds
- **Concurrent Connections:** 500+
- **Transaction Throughput:** 500+ ops/second
- **Uptime Target:** 99.5% SLA

### Optimization Techniques
- Database indexing on frequently queried columns
- Connection pooling for database connections
- Response caching where appropriate
- Efficient Socket.io event handling
- Code splitting and lazy loading in frontend

---

## 🚀 Deployment

### Production Deployment

#### Using Docker
```bash
# Build Docker image
docker build -t hms:latest .

# Run container
docker run -p 5000:5000 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="your_secret" \
  hms:latest
```

#### Using Traditional Server
See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed instructions.

### Environment Variables
- Set all `.env` variables before deployment
- Use secure secrets management (HashiCorp Vault, AWS Secrets Manager, etc.)
- Enable HTTPS/TLS
- Configure proper database backups

---

## 📝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Make your changes
4. Write tests for new functionality
5. Commit your changes (`git commit -m 'Add AmazingFeature'`)
6. Push to the branch (`git push origin feature/AmazingFeature`)
7. Open a Pull Request

---

## 👥 Team

**Vignan's Foundation for Science, Technology & Research**
**CSE Department - Field Project Team**

| Name | Registration | Role |
|------|--------------|------|
| CH. JOSHITHA | 241FA04213 | Lead Frontend Developer |
| P. BHAVYA SRI | 241FA04296 | Backend Developer |
| P. GAYATHRI SOWMYA | 241FA04353 | Database & Testing |
| S. BALA SRAVANTHI | 241FA04513 | DevOps & Documentation |

**Guide:** Mrs. NALLURI BHARGAVI (Assistant Professor, CSE Department)

---

## 📚 Documentation

- [API Documentation](docs/API_DOCUMENTATION.md) - Complete endpoint reference
- [Architecture Guide](docs/ARCHITECTURE.md) - System design and components
- [Setup Guide](docs/SETUP.md) - Installation and configuration
- [Testing Guide](docs/TESTING.md) - Test procedures and coverage
- [Database Schema](docs/DATABASE_SCHEMA.md) - ER diagrams and relationships
- [Deployment Guide](docs/DEPLOYMENT.md) - Production deployment

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 💬 Support

### Getting Help
- Check the [documentation](docs/)
- Open an [issue](https://github.com/sanjutalari/hospital-management-system/issues)
- Contact the development team

### Reporting Bugs
Please use the [issue tracker](https://github.com/sanjutalari/hospital-management-system/issues) to report bugs.

---

## 🙏 Acknowledgments

- Vignan's Foundation for Science, Technology & Research
- Open source community
- All contributors and supporters

---

**Last Updated:** April 27, 2026
**Version:** 1.0.0
**Status:** Production Ready ✅

