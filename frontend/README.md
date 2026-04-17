# Stockify Frontend (React + TypeScript + Vite)

Frontend application for **Stockify**, an inventory management system.

This app provides:
- authentication (login/register)
- JWT-based protected routing
- role-aware dashboard UI
- category and product creation forms
- inventory table and summary cards
- smooth in-page section navigation

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Application Flow](#application-flow)
4. [Authentication & Session Management](#authentication--session-management)
5. [Dashboard Features](#dashboard-features)
6. [API Integration](#api-integration)
7. [Styling and UI System](#styling-and-ui-system)
8. [Environment & Backend Requirements](#environment--backend-requirements)
9. [Run the Frontend](#run-the-frontend)
10. [Available Scripts](#available-scripts)
11. [Current Behavior Notes](#current-behavior-notes)

---

## Tech Stack

- **Framework:** React 19
- **Language:** TypeScript
- **Bundler:** Vite 8
- **Routing:** React Router
- **State Management:** Zustand
- **HTTP Client:** Axios
- **Styling:** Tailwind CSS v4
- **UI Primitives:** shadcn/ui-style components + Radix UI
- **Icons:** lucide-react

---

## Project Structure

Key frontend files and folders:

- `src/routes/AppRouter.tsx`  
  Main router, route protection and redirects.

- `src/routes/Auth.tsx`  
  Login/Register page.

- `src/routes/Dashboard.tsx`  
  Main authenticated dashboard with forms, cards, table, and analytics section.

- `src/stores/auth-store.ts`  
  JWT token storage, logout handling, user profile decoding from JWT payload.

- `src/services/api/axios.ts`  
  Configured Axios instance with `baseURL` and auth header interceptor.

- `src/hooks/use-get-inventory-items.ts`  
  Data-fetching hook for inventory table (`/products`) with loading/error states.

- `src/components/ui/*`  
  Shared UI primitives (`Button`, `Input`, `Card`, `Table`, `Avatar`, `DropdownMenu`).

- `src/lib/types.ts`  
  Shared frontend domain types (`InventoryItem`, `UserRole`, `UserProfile`, `Category`).

---

## Application Flow

1. User opens app.
2. Router checks token in Zustand store.
3. If no token → redirect to `/auth`.
4. User logs in or registers, then logs in automatically.
5. Token is saved to `localStorage` and app state.
6. Router redirects user to `/` (Dashboard).
7. Dashboard loads categories and products, and renders role-aware UI.

---

## Authentication & Session Management

### Routes

- `/auth` — public auth page
- `/` — protected dashboard

### Guard logic (`AppRouter`)

- If `token` exists:
  - `/auth` redirects to `/`
- If `token` does not exist:
  - `/` redirects to `/auth`

### Token handling (`auth-store`)

- Token key: `stockify_token`
- On login:
  - token saved to `localStorage`
  - JWT payload decoded (`sub`, `email`, `role`)
  - profile stored in Zustand as `user`
- On logout:
  - token removed from storage
  - `user` cleared

---

## Dashboard Features

### 1) Sidebar navigation

Left menu buttons are interactive and scroll to sections:
- `Overview`
- `Inventory`
- `Analytics`

Each button updates active visual state.

### 2) Personal cabinet card

Displays current session info:
- user email
- user role badge (`ADMIN`, `MANAGER`, `WORKER`)

### 3) Category creation form

- Calls `POST /categories`
- Intended for `ADMIN` role (UI and backend policy)
- Supports name + optional description

### 4) Product creation form

- Calls `POST /products`
- Intended for `ADMIN` role
- Fields: name, quantity, price, category

### 5) Summary metrics

Cards display:
- total stock quantity
- low stock items count
- pending orders (static placeholder)
- out-of-stock items count

### 6) Inventory table

Data source: `GET /products?take=10`

Columns:
- Name
- SKU (derived client-side)
- Quantity
- Status (`In Stock`, `Low`, `Out of Stock`)

Behavior:
- loading state
- empty state (`No inventory items yet.`)
- error fallback with mock data

### 7) Analytics section

Displays quick indicators:
- total categories
- SKU count shown in table
- low stock count

---

## API Integration

Axios instance is configured in `src/services/api/axios.ts`:

- `baseURL`: `http://localhost:3000`
- JSON content type by default
- request interceptor automatically adds:

```text
Authorization: Bearer <token>
```

Main backend endpoints used by frontend:

- `POST /auth/register`
- `POST /auth/login`
- `GET /categories`
- `POST /categories`
- `GET /products`
- `POST /products`

---

## Styling and UI System

- Tailwind CSS v4 is enabled via Vite plugin.
- Design tokens and dark theme variables are defined in `src/index.css`.
- Components follow shadcn-style patterns and use `cn()` helper (`clsx + tailwind-merge`).
- Dashboard uses a modern dark-first layout with cards, subtle borders, and spacious composition.

---

## Environment & Backend Requirements

This frontend assumes backend is running on:

`http://localhost:3000`

Required backend capabilities:
- CORS enabled for `http://localhost:5173`
- JWT auth endpoints (`/auth/register`, `/auth/login`)
- categories/products endpoints

If backend URL changes, update `baseURL` in:

`src/services/api/axios.ts`

---

## Run the Frontend

Install dependencies:

```bash
pnpm install
```

Start dev server:

```bash
pnpm run dev
```

Default dev URL:

`http://localhost:5173`

---

## Available Scripts

```bash
pnpm run dev      # start Vite dev server
pnpm run build    # type-check + production build
pnpm run preview  # preview production build
pnpm run lint     # lint project
```

---

## Current Behavior Notes

- Role checks exist on both frontend and backend, but backend is the source of truth.
- On inventory fetch failure, mock data is shown as graceful fallback.
- Some UI labels/messages are currently in Russian; this can be internationalized later.
- Pending orders metric is currently static placeholder data.

---

If needed, next step can be a dedicated section in this README with **end-to-end user scenarios** (register as ADMIN, create category, create product, verify table updates).
