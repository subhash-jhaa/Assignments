# Software Developer Assignment: User Management & Task Tracker

# Subhash Jha

A production-ready full-stack application built to satisfy all requirements of the hiring evaluation assignment. It features a robust **Node.js (Express + TypeScript + Prisma + PostgreSQL)** REST API and a modern, responsive **React 18 (Vite + TypeScript + Tailwind CSS)** frontend.

---

## 📋 Table of Contents
- [Project Overview](#-project-overview)
- [Evaluation Criteria & Verification](#-evaluation-criteria--verification)
- [Repository Structure](#-repository-structure)
- [Pre-Seeded Demo Accounts](#-pre-seeded-demo-accounts)
- [Setup & Running Locally](#-setup--running-locally)
  - [Prerequisites](#prerequisites)
  - [1. Backend Setup & Run](#1-backend-setup--run)
  - [2. Frontend Setup & Run](#2-frontend-setup--run)
  - [3. Running from Workspace Root](#3-running-from-workspace-root)
- [Running Automated Tests](#-running-automated-tests)
- [Sample API Requests (`curl` & JSON)](#-sample-api-requests-curl--json)
  - [Authentication Endpoints](#1-authentication-endpoints)
  - [Task Management Endpoints](#2-task-management-endpoints)
  - [Admin User Management Endpoints](#3-admin-user-management-endpoints)
- [Security Implementation & Safeguards](#-security-implementation--safeguards)

---

## 🚀 Project Overview

The system provides a secure task tracking platform with comprehensive **Role-Based Access Control (RBAC)**:
- **Normal Users (`USER`)**: Register, authenticate, manage and track their own personal tasks (Create, Read, Update, Delete, Toggle Status).
- **Administrators (`ADMIN`)**: Complete system visibility — view and manage tasks across all users, inspect user accounts, and delete users (with automatic cascade deletion of their tasks).
- **Zero Placeholder Data**: Connected to a live PostgreSQL database (Neon / local) via Prisma ORM with typed migrations.


## 📁 Repository Structure

```text
Assignment/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma         # Database schema (User, Task, Enums)
│   │   ├── migrations/           # Version-controlled SQL migrations
│   │   └── seed.ts               # Database seeder for demo accounts & tasks
│   ├── src/
│   │   ├── config/               # Prisma singleton & environment validation
│   │   ├── errors/               # Centralized AppError class
│   │   ├── middlewares/          # JWT auth, RBAC guard, input validation, error handling
│   │   ├── modules/
│   │   │   ├── auth/             # Register, Login, /me (validator, service, controller, routes)
│   │   │   ├── tasks/            # Task CRUD with user ownership & admin bypass
│   │   │   └── users/            # Admin-only user listing and deletion
│   │   ├── types/                # TypeScript interfaces & Express module augmentation
│   │   ├── utils/                # JWT sign & verify helpers
│   │   ├── app.ts                # Express app configuration & middleware pipeline
│   │   └── index.ts              # Server bootstrap and port listener
│   ├── tests/                    # 29 automated tests (auth.test.ts, tasks.test.ts, users.test.ts)
│   ├── .env.example              # Backend environment template
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/                  # API client entry point
│   │   ├── components/           # UI components (Modal, Input, Button, TaskCard, UserTable)
│   │   ├── constants/            # Role constants and enum maps
│   │   ├── context/              # AuthContext (token storage, login, logout, user state)
│   │   ├── pages/                # LoginPage, RegisterPage, DashboardPage
│   │   ├── services/             # Axios instance with request/response interceptors
│   │   ├── types/                # TypeScript definitions matching backend models
│   │   └── App.tsx               # Routing with protected route guards
│   ├── tests/                    # 12 automated tests (AuthFlow, LoginForm, TaskCard)
│   ├── .env.example              # Frontend environment template
│   └── package.json
│
├── package.json                  # Root runner scripts (build & test both packages)
├── .gitignore                    # Ensures .env, node_modules, and dist are never committed
└── README.md                     # Root project documentation
```

---

## 👥 Pre-Seeded Demo Accounts

To quickly test the application without manual registration, run the seed script:

```bash
cd backend
npm run seed
```

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Admin** | `admin@taskflow.dev` | `Admin12345!` | Full system access: manage all tasks + User Management dashboard |
| **Normal User** | `user@taskflow.dev` | `User12345!` | Personal task management: view, create, edit, toggle, delete own tasks |

---

## ⚡ Setup & Running Locally

### Prerequisites
- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **PostgreSQL**: PostgreSQL database (local or cloud instance like Neon / Supabase)

---

### 1. Backend Setup & Run

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env from template
cp .env.example .env
```

Ensure your `backend/.env` file contains:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
JWT_SECRET="your_jwt_super_secret_key_at_least_32_characters"
JWT_EXPIRES_IN="24h"
```

Run database migrations and seed demo data:
```bash
# Apply Prisma migrations
npx prisma migrate dev --name init

# Seed database with demo admin, user, and tasks
npm run seed

# Start development server
npm run dev
```

> **Backend API URL**: `http://localhost:5000`  
> **Health Check**: `GET http://localhost:5000/api/health`

---

### 2. Frontend Setup & Run

```bash
# Open a new terminal and navigate to frontend
cd frontend

# Install dependencies
npm install

# Create .env from template
cp .env.example .env
```

Ensure your `frontend/.env` file contains:
```env
VITE_API_URL="http://localhost:5000/api"
```

Start the frontend development server:
```bash
npm run dev
```

> **Frontend Web App**: `http://localhost:5173` (or `http://localhost:5174`)

---

### 3. Running from Workspace Root

The workspace includes a root `package.json` for convenience:

```bash
# From the project root directory:

# Build both backend (tsc) and frontend (vite build)
npm run build

# Run all test suites across the full stack
npm run test
```

---

## 🧪 Running Automated Tests

The application includes comprehensive test suites covering unit and integration behaviors.

### Run Backend Tests (Jest + Supertest)
```bash
cd backend
npm test
```
- **Coverage**: 29 automated tests verifying:
  - User registration (validation, password hashing, duplicate email detection)
  - User authentication (JWT generation, invalid credentials rejection)
  - Task CRUD operations with ownership constraints
  - Role-Based Access Control (RBAC) ensuring normal users cannot view/edit others' tasks or access admin routes
  - Cascade deletion of tasks when a user is deleted

### Run Frontend Tests (Vitest + React Testing Library)
```bash
cd frontend
npm test
```
- **Coverage**: 12 automated tests verifying:
  - Protected route redirection for unauthenticated visitors
  - Authentication flow & JWT storage persistence
  - Login form input validation and error handling
  - Task card rendering, status toggling, and action triggers

---

## 📡 Sample API Requests (`curl` & JSON)

### 1. Authentication Endpoints

#### Register a New User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "Password123!",
    "role": "USER"
  }'
```
**Response (`201 Created`):**
```json
{
  "message": "User registered successfully.",
  "user": {
    "id": "c1f72b9a-4123-4567-89ab-cdef01234567",
    "email": "newuser@example.com",
    "role": "USER"
  }
}
```

#### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@taskflow.dev",
    "password": "Admin12345!"
  }'
```
**Response (`200 OK`):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "a82b3c4d-5678-90ab-cdef-1234567890ab",
    "email": "admin@taskflow.dev",
    "role": "ADMIN"
  }
}
```

#### Get Current Authenticated User (`/me`)
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```
**Response (`200 OK`):**
```json
{
  "user": {
    "id": "a82b3c4d-5678-90ab-cdef-1234567890ab",
    "email": "admin@taskflow.dev",
    "role": "ADMIN",
    "createdAt": "2026-09-22T12:00:00.000Z"
  }
}
```

---

### 2. Task Management Endpoints

#### Create a Task
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -d '{
    "title": "Set up PostgreSQL Database",
    "description": "Configure Neon connection pooling and Prisma migrations.",
    "status": "PENDING"
  }'
```
**Response (`201 Created`):**
```json
{
  "message": "Task created successfully.",
  "task": {
    "id": "e98a1234-bcde-f012-3456-789abcdef012",
    "title": "Set up PostgreSQL Database",
    "description": "Configure Neon connection pooling and Prisma migrations.",
    "status": "PENDING",
    "userId": "a82b3c4d-5678-90ab-cdef-1234567890ab",
    "createdAt": "2026-09-22T12:10:00.000Z",
    "updatedAt": "2026-09-22T12:10:00.000Z"
  }
}
```

#### Get All Tasks
- *For `USER`*: Returns only tasks owned by the requesting user.
- *For `ADMIN`*: Returns all tasks in the system with associated user details.
```bash
curl -X GET http://localhost:5000/api/tasks \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

#### Update / Toggle Task Status
```bash
curl -X PUT http://localhost:5000/api/tasks/<TASK_ID> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -d '{
    "status": "COMPLETED"
  }'
```

#### Delete a Task
```bash
curl -X DELETE http://localhost:5000/api/tasks/<TASK_ID> \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```
**Response (`200 OK`):**
```json
{
  "message": "Task deleted successfully."
}
```

---

### 3. Admin User Management Endpoints

*(Requires Bearer token of a user with `ADMIN` role. Normal users receive `403 Forbidden`)*

#### Get All Users
```bash
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer <ADMIN_JWT_TOKEN>"
```
**Response (`200 OK`):**
```json
{
  "users": [
    {
      "id": "a82b3c4d-5678-90ab-cdef-1234567890ab",
      "email": "admin@taskflow.dev",
      "role": "ADMIN",
      "createdAt": "2026-09-22T12:00:00.000Z",
      "_count": { "tasks": 2 }
    },
    {
      "id": "b12c3d4e-5678-90ab-cdef-1234567890cd",
      "email": "user@taskflow.dev",
      "role": "USER",
      "createdAt": "2026-09-22T12:05:00.000Z",
      "_count": { "tasks": 2 }
    }
  ]
}
```

#### Delete a User
*(Admins cannot delete their own active account)*
```bash
curl -X DELETE http://localhost:5000/api/users/<USER_ID> \
  -H "Authorization: Bearer <ADMIN_JWT_TOKEN>"
```
**Response (`200 OK`):**
```json
{
  "message": "User and associated tasks deleted successfully."
}
```

---

## 🔒 Security Implementation & Safeguards

1. **Strict Password Hashing**: Passwords are never stored in plain text. Hashed using `bcrypt` with 10 salt rounds before database persistence.
2. **Password Exposure Prevention**: User passwords are explicitly omitted in all Prisma query selections (`select: { id: true, email: true, role: true, createdAt: true }`).
3. **Secret Isolation**: All database URLs and JWT secrets are stored in `.env` files. Both root and child `.gitignore` configurations ensure zero credentials or environment files are ever committed.
4. **Stateless JWT Authorization**: Bearer tokens are signed with user identity (`userId`, `email`, `role`) and checked on every protected route via `authenticate` middleware.
5. **RBAC Guard**: The `authorizeRole(['ADMIN'])` middleware enforces strict role authorization at the route level.
6. **Input Sanitization & Validation**: `express-validator` validates email structure, password length ($\ge 8$ characters), and role constraints before controllers are executed.
