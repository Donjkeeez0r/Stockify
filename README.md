# Stockify — Fullstack Inventory Management Platform

Stockify is a fullstack web application for managing inventory, categories, products, and stock movements.

This repository contains:
- a **NestJS backend** with JWT authentication, RBAC, and Prisma/PostgreSQL
- a **React frontend** with protected routes, role-aware dashboard, and CRUD forms
- **Docker Compose** orchestration for local full environment startup

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Core Features](#core-features)
4. [Roles and Access Model](#roles-and-access-model)
5. [How the Website Works (End-to-End)](#how-the-website-works-end-to-end)
6. [Technology Stack](#technology-stack)
7. [Repository Structure](#repository-structure)
8. [Environment Variables](#environment-variables)
9. [Run the Project](#run-the-project)
10. [API and Frontend Ports](#api-and-frontend-ports)
11. [Main User Flows](#main-user-flows)
12. [Operational Notes](#operational-notes)
13. [Where to Find Detailed Docs](#where-to-find-detailed-docs)

---

## Project Overview

Stockify helps teams track product quantities, organize items by category, and register stock operations over time.

The system is designed with:
- secure authentication via JWT
- role-based restrictions for sensitive actions
- dashboard-driven workflow for daily operations
- API-first backend consumed by a modern frontend

---

## Architecture

Stockify uses a classic 3-part architecture:

1. **Frontend (`/frontend`)**
   - React + TypeScript + Vite
   - Handles user authentication UI, dashboard, forms, and section-based navigation
   - Sends authenticated requests to backend with Bearer token

2. **Backend (`/backend`)**
   - NestJS + Prisma + PostgreSQL
   - Exposes REST API for auth, categories, products, and inventory operations
   - Applies validation, business rules, JWT guard, and role guard

3. **Database (PostgreSQL)**
   - Stores users, roles, categories, products, and inventory transactions

---

## Core Features

### Authentication
- Register user (`/auth/register`)
- Login (`/auth/login`) and receive JWT token
- Frontend persists token and decodes user role/email for UI state

### Categories
- Create category (admin-only)
- List, view, update, delete categories

### Products
- Create product (admin-only)
- List products with pagination and filtering
- View single product
- Update and delete product

### Inventory
- Move stock with operation types:
  - `IN` (increase quantity)
  - `OUT` (decrease quantity)
  - `ADJUST` (set exact quantity)
- View transaction history

### Dashboard UX
- Protected dashboard route
- Personal cabinet with email and role
- Category and product creation forms
- Summary metric cards
- Inventory table with loading/empty/error states
- Sidebar section buttons (Overview / Inventory / Analytics)

---

## Roles and Access Model

Available roles:
- `ADMIN`
- `MANAGER`
- `WORKER`

Current policy:
- `POST /categories` → **ADMIN only**
- `POST /products` → **ADMIN only**
- Update/Delete endpoints require authenticated user
- Backend remains source of truth for authorization

---

## How the Website Works (End-to-End)

1. User opens frontend at `http://localhost:5173`.
2. Router checks whether JWT token exists in local storage.
3. Without token, user is redirected to `/auth`.
4. User logs in (or registers then logs in automatically).
5. Frontend stores token and decodes role from JWT payload.
6. User enters dashboard (`/`).
7. Frontend loads categories and products via backend API.
8. If user role is `ADMIN`, category/product creation forms are actionable.
9. Inventory table displays products mapped to stock statuses.
10. Sidebar buttons smoothly scroll to dashboard sections.

---

## Technology Stack

### Frontend
- React 19
- TypeScript
- Vite 8
- React Router
- Zustand
- Axios
- Tailwind CSS v4
- shadcn-style UI components + Radix primitives
- lucide-react icons

### Backend
- NestJS
- Prisma ORM
- PostgreSQL
- JWT (Passport)
- class-validator / class-transformer
- Swagger (`/api/docs`)

### DevOps
- Docker + Docker Compose
- pnpm

---

## Repository Structure

```text
main/
├── backend/      # NestJS API, Prisma schema/migrations, business logic
├── frontend/     # React app, routes, state, UI components
├── docker-compose.yml
└── .env
```

---

## Environment Variables

Configured in root `.env`.

Typical required keys:

```env
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=stockify_db
JWT_SECRET=your_jwt_secret
```

Optional/customizable:

```env
PORT=3000
FRONTEND_URL=http://localhost:5173
DATABASE_URL=postgresql://user:password@host:5432/db?schema=public
```

---

## Run the Project

### Recommended: Docker Compose (full stack)

From `main/` directory:

```bash
docker compose up -d --build
```

This starts:
- `db` (PostgreSQL)
- `backend` (NestJS API)
- `frontend` (Vite app)

### Local/manual mode (separate terminals)

Backend:

```bash
cd backend
pnpm install
pnpm prisma generate
pnpm prisma migrate dev
pnpm run start:dev
```

Frontend:

```bash
cd frontend
pnpm install
pnpm run dev
```

---

## API and Frontend Ports

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000`
- Swagger docs: `http://localhost:3000/api/docs`
- Postgres: `localhost:5432`

---

## Main User Flows

### Flow A: Admin creates category and product

1. Register/login as role `ADMIN`
2. Open dashboard
3. Create category in “Add category” form
4. Create product in “Add product” form
5. Product appears in inventory table and metrics update

### Flow B: Worker/Manager browsing

1. Login as non-admin role
2. Dashboard is accessible
3. Creation forms are visible but admin-restricted actions fail server-side
4. User can still view inventory and analytics sections

### Flow C: Inventory updates (API-driven)

1. Authenticated user calls `/inventory/move`
2. Backend updates product quantity according to operation type
3. Transaction record is created and available in `/inventory/transactions`

---

## Operational Notes

- If backend errors indicate missing tables, apply migrations (`prisma migrate dev` or `migrate deploy` in Docker).
- JWT token is automatically attached by frontend Axios interceptor.
- CORS on backend allows local frontend origins.
- Empty product list is shown as empty state in UI; fallback mock data is used only when product request fails.

---

## Where to Find Detailed Docs

- Full backend technical docs: `backend/README.md`
- Full frontend technical docs: `frontend/README.md`

These two files contain module-level and implementation-level details.
