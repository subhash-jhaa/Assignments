# Full-Stack Hiring Assignment – User Management & Task Tracker

This repository contains the complete submission for both the **Backend Hiring Assignment** and **Frontend Hiring Assignment**.

---

## 📁 Repository Structure

```text
.
├── backend/                  # Node.js (Express + TypeScript + Prisma + PostgreSQL)
│   ├── prisma/               # Database schema & migrations
│   ├── src/                  # Controllers, middleware, routes, services
│   ├── tests/                # Unit & API integration tests
│   ├── .env.example
│   └── README.md             # Backend setup & API endpoint documentation
│
├── frontend/                 # React 18 + Vite + TypeScript + Tailwind CSS
│   ├── src/                  # Pages, components, context, services
│   ├── tests/                # Component & Integration tests (Vitest)
│   ├── .env.example
│   └── README.md             # Frontend setup & testing guide
│
├── .gitignore
└── README.md
```

---

## ⚡ Quick Start

### 1. Frontend Setup
```bash
cd frontend
npm install
npm test       # Run all 11 unit & integration tests
npm run dev    # Launch frontend at http://localhost:5173
```

*(By default, the frontend is configured with `VITE_USE_MOCK=true` in `.env` to enable instant evaluation of all features without requiring an active PostgreSQL database).*

### 2. Backend Setup
*(Coming up in Phase 2)*
```bash
cd backend
npm install
npm test       # Run unit & API integration tests
npm run dev    # Start API server on http://localhost:5000
```
