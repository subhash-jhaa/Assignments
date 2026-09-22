# User Management & Task Tracker – Frontend Application

A production-ready **User Management & Task Tracker** web client built with **React 18**, **TypeScript**, **Vite**, and **Tailwind CSS**.

---

## 1. Project Overview

This frontend application allows users to register, log in, and manage personal tasks with full CRUD capabilities. It provides strict Role-Based Access Control (RBAC):
- **Normal Users**: Manage and view only their own personal tasks.
- **Admin Users**: Access an administrative control panel on the dashboard to view and manage all tasks across the system, as well as view and delete registered user accounts.

---

## 2. Technology Stack

- **Framework**: React 18 + Vite
- **Language**: TypeScript (strict typing with zero `any`)
- **Styling**: Tailwind CSS v4 + Inter Font
- **Icons**: Lucide React
- **Routing**: React Router v6
- **HTTP Client**: Axios with centralized request & response interceptors
- **Testing**: Vitest + React Testing Library + JSDOM

---

## 3. Folder Structure

```text
frontend/
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   └── UserTable.tsx         # Admin user table with delete action
│   │   ├── common/
│   │   │   ├── Button.tsx            # Button with variants and loading state
│   │   │   ├── Input.tsx             # Accessible input with error messages
│   │   │   └── Modal.tsx             # Dialog with backdrop and scroll lock
│   │   ├── layout/
│   │   │   ├── Navbar.tsx            # Header with email, role badge & logout
│   │   │   └── ProtectedRoute.tsx    # Route guard redirecting to /login
│   │   └── tasks/
│   │       ├── TaskCard.tsx          # Card view for tasks with status toggle
│   │       └── TaskFormModal.tsx     # Create & edit task modal dialog
│   ├── constants/
│   │   └── roles.ts                  # Centralized ROLES constant (USER, ADMIN)
│   ├── context/
│   │   └── AuthContext.tsx           # Global authentication state & methods
│   ├── pages/
│   │   ├── DashboardPage.tsx         # Unified dashboard: personal tasks & admin controls
│   │   ├── LoginPage.tsx             # Login page with field validation
│   │   └── RegisterPage.tsx          # Registration page with clean validation
│   ├── services/
│   │   └── api.ts                    # Single source of truth API service
│   ├── types/
│   │   └── index.ts                  # TypeScript interfaces (User, Task, Payloads)
│   ├── utils/
│   │   └── storage.ts                # Centralized JWT token & session storage
│   ├── App.tsx                       # Main router configuration
│   ├── index.css                     # Global styles & Tailwind directives
│   └── main.tsx                      # Application DOM mount
├── tests/
│   ├── setup.ts                      # Test setup with jest-dom matchers & env defaults
│   ├── LoginForm.test.tsx            # Component tests: Login validation & rendering
│   ├── TaskCard.test.tsx             # Component tests: Task status toggle & callbacks
│   └── AuthFlow.test.tsx             # Integration tests: Auth redirect, token storage
├── .env.example                      # Template environment variable
├── package.json
├── tsconfig.app.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 4. Environment Setup & Required Variables

The application relies strictly on environment variables for API communication. **No backend URLs are hardcoded in source code.**

### Required Variable:
- **`VITE_API_URL`**: Base URL of the backend API service (e.g. `http://localhost:5000/api`).

Copy the template file to create your local `.env`:

```bash
cp .env.example .env
```

`.env` configuration example:
```env
# Backend API Base URL
VITE_API_URL=http://localhost:5000/api
```

> **Security Note**: `.env` is ignored by Git in `.gitignore` to prevent any credentials or local configuration from leaking to GitHub. Only `.env.example` is committed.

---

## 5. Installation & Getting Started

```bash
# 1. Enter frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

The application will run at:
```text
http://localhost:5173
```

---

## 6. Production Build & Linting

```bash
# Check TypeScript types and build production bundle
npm run build

# Run linting check
npm run lint

# Preview the production build locally
npm run preview
```

---

## 7. Automated Testing

The project includes unit, component, and integration tests built with **Vitest** and **React Testing Library**:

```bash
# Run all test suites
npm test

# Run tests in watch mode
npm run test:watch
```

### Test Coverage:
1. **`tests/LoginForm.test.tsx` (Component Test)**:
   - Field rendering (email, password, submit button).
   - Empty input validation.
   - Invalid email format error detection.
   - Password minimum length verification.
2. **`tests/TaskCard.test.tsx` (Component Test)**:
   - Task details and status badge rendering.
   - Status toggle callback execution.
   - Edit and delete callback triggers.
   - Admin owner tag rendering.
3. **`tests/AuthFlow.test.tsx` (Integration Test)**:
   - Unauthenticated redirect from `/dashboard` to `/login`.
   - Successful login session and token persistence in storage.
   - API error alert display on authentication failure.

---

## 8. API Integration Architecture

All network communication is centralized in [`src/services/api.ts`](file:///c:/Users/subha/Desktop/Assignment/frontend/src/services/api.ts):
- **Axios Instance**: Reads `VITE_API_URL`.
- **Request Interceptor**: Automatically attaches `Authorization: Bearer <token>` from `src/utils/storage.ts`.
- **Response Interceptor**: Automatically intercepts `401 Unauthorized` responses, clears stored authentication tokens, and redirects the user to `/login?session_expired=true`.
- **Error Formatting**: Formats HTTP errors (`400`, `401`, `403`, `404`, `409`, `422`, `500`, and network failures) into friendly user messages.

### Endpoints Handled:
- `POST /auth/register` $\rightarrow$ `api.register(payload)`
- `POST /auth/login` $\rightarrow$ `api.login(payload)`
- `GET /tasks` $\rightarrow$ `api.getTasks()`
- `POST /tasks` $\rightarrow$ `api.createTask(payload)`
- `PUT /tasks/:id` $\rightarrow$ `api.updateTask(id, payload)`
- `DELETE /tasks/:id` $\rightarrow$ `api.deleteTask(id)`
- `GET /users` $\rightarrow$ `api.getUsers()` (Admin only)
- `DELETE /users/:id` $\rightarrow$ `api.deleteUser(id)` (Admin only)

---

## 9. Authentication Flow & State Management

1. **Hydration**: On application load, `AuthContext` reads the user profile and JWT token from `localStorage` via [`src/utils/storage.ts`](file:///c:/Users/subha/Desktop/Assignment/frontend/src/utils/storage.ts).
2. **Route Guarding**: `<ProtectedRoute>` prevents unauthenticated users from accessing `/dashboard`.
3. **Logout**: Clicking the Logout button in the header invokes `logout()`, clears token and user storage, and redirects to `/login`.

---

## 10. Role-Based Behavior & UX

- **Roles Definition**: Centrally managed in [`src/constants/roles.ts`](file:///c:/Users/subha/Desktop/Assignment/frontend/src/constants/roles.ts) as `USER: 'user'` and `ADMIN: 'admin'`.
- **Task Management**:
  - Desktop view ($\ge$ 640px) displays a structured HTML table.
  - Mobile view (< 640px) automatically switches to responsive stacked cards.
  - Status toggle (Pending $\leftrightarrow$ Completed) with instant optimistic UI update.
  - Inline editing: Edit title and description directly within the row/card with Save and Cancel buttons.
- **Admin Capabilities**:
  - When `user.role === 'admin'`, the dashboard automatically loads and displays the **User Management** table.
  - Displays user ID, email, role badge, and a **Delete User** action (self-deletion safely blocked).
  - Admin sees tasks created across all accounts with creator user IDs.
