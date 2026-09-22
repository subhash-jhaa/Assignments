# Backend — User Management & Task Tracker API

A production-ready REST API built with **Node.js + Express + TypeScript + Prisma + PostgreSQL**.

---

## Tech Stack

| Layer        | Technology                     |
|--------------|-------------------------------|
| Runtime      | Node.js 18+                   |
| Framework    | Express 4                     |
| Language     | TypeScript (strict)           |
| ORM          | Prisma 5                      |
| Database     | PostgreSQL                    |
| Auth         | JWT + bcrypt                  |
| Validation   | express-validator             |
| Testing      | Jest + ts-jest + Supertest    |

---

## Prerequisites

- Node.js >= 18
- npm >= 9
- PostgreSQL running locally (or a cloud URL from Neon/Supabase)

---

## Setup

```bash
# 1. Install dependencies
cd backend
npm install

# 2. Copy environment file and fill in your values
cp .env.example .env
# Edit .env — set DATABASE_URL and JWT_SECRET

# 3. Generate Prisma client
npx prisma generate

# 4. Run database migrations
npx prisma migrate dev --name init

# 5. Start the development server
npm run dev
```

Server starts at: **http://localhost:5000**

---

## Environment Variables

| Variable       | Description                          | Example                                             |
|----------------|--------------------------------------|-----------------------------------------------------|
| `PORT`         | Server port                          | `5000`                                              |
| `DATABASE_URL` | PostgreSQL connection string         | `postgresql://postgres:pass@localhost:5432/taskdb`  |
| `JWT_SECRET`   | Secret key for signing JWTs          | `supersecretkey_change_in_production`               |
| `JWT_EXPIRES_IN` | JWT token expiry                  | `24h`                                               |
| `NODE_ENV`     | Environment (`development`/`production`/`test`) | `development`               |

---

## API Endpoints

### Auth (`/api/auth`)

| Method | Endpoint              | Auth | Body                                  | Response                        |
|--------|-----------------------|------|---------------------------------------|---------------------------------|
| POST   | `/api/auth/register`  | ❌   | `{ email, password, role? }`          | `{ message, user }`             |
| POST   | `/api/auth/login`     | ❌   | `{ email, password }`                 | `{ token, user }`               |
| GET    | `/api/auth/me`        | ✅   | —                                     | `{ user }`                      |

### Tasks (`/api/tasks`)

| Method | Endpoint              | Auth | Role         | Description                      |
|--------|-----------------------|------|--------------|----------------------------------|
| GET    | `/api/tasks`          | ✅   | Any          | Admin: all tasks; User: own only |
| POST   | `/api/tasks`          | ✅   | Any          | Create a task                    |
| GET    | `/api/tasks/:id`      | ✅   | Owner/Admin  | Get task by ID                   |
| PUT    | `/api/tasks/:id`      | ✅   | Owner/Admin  | Update task                      |
| DELETE | `/api/tasks/:id`      | ✅   | Owner/Admin  | Delete task                      |

### Users (`/api/users`) — Admin Only

| Method | Endpoint              | Auth | Role  | Description               |
|--------|-----------------------|------|-------|---------------------------|
| GET    | `/api/users`          | ✅   | Admin | Get all users             |
| GET    | `/api/users/:id`      | ✅   | Admin | Get user by ID with tasks |
| DELETE | `/api/users/:id`      | ✅   | Admin | Delete user               |

---

## Sample curl Commands

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"password123"}'

# Get my profile (replace TOKEN)
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer TOKEN"

# Create a task
curl -X POST http://localhost:5000/api/tasks \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"My Task","description":"Do something","status":"PENDING"}'

# Get all tasks
curl http://localhost:5000/api/tasks \
  -H "Authorization: Bearer TOKEN"

# Update a task
curl -X PUT http://localhost:5000/api/tasks/TASK_ID \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"COMPLETED"}'

# Delete a task
curl -X DELETE http://localhost:5000/api/tasks/TASK_ID \
  -H "Authorization: Bearer TOKEN"

# Admin: Get all users
curl http://localhost:5000/api/users \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## Error Response Format

All errors follow this structure:
```json
{
  "error": "Human-readable error message.",
  "statusCode": 400
}
```

---

## Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Watch mode
npm run test:watch
```

> **Note**: Tests use your `DATABASE_URL` from `.env`. Set `NODE_ENV=test` to suppress query logs during tests.

---

## Scripts

| Script              | Description                          |
|---------------------|--------------------------------------|
| `npm run dev`       | Start dev server with hot reload     |
| `npm run build`     | Compile TypeScript to `dist/`        |
| `npm start`         | Run compiled production build        |
| `npm test`          | Run all tests                        |
| `npm run prisma:generate` | Regenerate Prisma client      |
| `npm run prisma:migrate`  | Run pending migrations         |
| `npm run prisma:studio`   | Open Prisma Studio GUI         |
