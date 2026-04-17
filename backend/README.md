# Stockify Backend (NestJS + Prisma)

Backend service for **Stockify**, an inventory management system.

This API provides:
- JWT authentication
- Role-based access control (RBAC)
- Category and product management
- Inventory stock movement with transaction history
- PostgreSQL persistence via Prisma

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Architecture](#project-architecture)
3. [Business Flow Overview](#business-flow-overview)
4. [Authentication & Authorization](#authentication--authorization)
5. [Database Model (Prisma)](#database-model-prisma)
6. [Environment Variables](#environment-variables)
7. [Run the Backend](#run-the-backend)
8. [API Documentation (Swagger)](#api-documentation-swagger)
9. [REST API Endpoints](#rest-api-endpoints)
10. [Validation, Error Handling, and CORS](#validation-error-handling-and-cors)
11. [Scripts](#scripts)
12. [Known Notes](#known-notes)

---

## Tech Stack

- **Framework:** NestJS (TypeScript)
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Auth:** JWT + Passport
- **Validation:** class-validator + class-transformer
- **Password hashing:** bcrypt
- **Docs:** Swagger (`/api/docs`)
- **Package manager:** pnpm

---

## Project Architecture

Main modules in `src/`:

- `auth/`  
  Registration, login, JWT strategy, guards, and role checks.

- `categories/`  
  CRUD for product categories.

- `products/`  
  CRUD for products + filtering and pagination.

- `inventory/`  
  Stock operations (`IN`, `OUT`, `ADJUST`) and transaction history.

- `prisma/`  
  Prisma service/module for database access.

Application bootstrap is in `src/main.ts`:
- Global `ValidationPipe` (`whitelist`, `transform`)
- CORS enabled for frontend origins
- Swagger setup on `/api/docs`

---

## Business Flow Overview

1. User registers and logs in.
2. API returns `access_token` (JWT).
3. Client sends `Authorization: Bearer <token>` for protected routes.
4. Backend checks token validity (`JwtAuthGuard`).
5. For admin-only routes, backend also checks role (`RolesGuard`).
6. Product/category/stock operations are persisted to PostgreSQL.
7. Inventory changes are tracked in `InventoryTransaction`.

---

## Authentication & Authorization

### JWT

- Login endpoint issues JWT containing:
  - `sub` (user id)
  - `email`
  - `role`
- JWT expiration is configured for **1 day**.

### Roles

Role enum (`prisma/schema.prisma`):
- `ADMIN`
- `MANAGER`
- `WORKER`

### Access Policy (current implementation)

- `POST /categories` → **ADMIN only**
- `POST /products` → **ADMIN only**
- `PATCH /categories/:id`, `DELETE /categories/:id` → authenticated user
- `PATCH /products/:id`, `DELETE /products/:id` → authenticated user
- `GET` endpoints are public unless explicitly guarded

> Note: If you want stricter policy (e.g. only `ADMIN` for update/delete too), extend `@Roles(...)` on those routes.

---

## Database Model (Prisma)

Defined in `prisma/schema.prisma`.

### Entities

#### `User`
- `id` (PK)
- `email` (unique)
- `password` (hashed)
- `role` (`ADMIN | MANAGER | WORKER`)
- `createdAt`

#### `Category`
- `id` (PK)
- `name` (unique)
- `description` (optional)
- `createdAt`
- relation: one-to-many with `Product`

#### `Product`
- `id` (PK)
- `name`
- `quantity` (default `0`)
- `price`
- `categoryId` (FK)
- relation: many-to-one with `Category`
- relation: one-to-many with `InventoryTransaction`

#### `InventoryTransaction`
- `id` (PK)
- `amount`
- `comment` (optional)
- `type` (`IN | OUT | ADJUST`)
- `productId` (FK)
- `userId` (FK)
- `createdAt`

---

## Environment Variables

The project uses root `.env` values for local/docker workflow.

Required keys:

```env
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=stockify_db
JWT_SECRET=your_jwt_secret
```

Optional:

```env
PORT=3000
FRONTEND_URL=http://localhost:5173
DATABASE_URL=postgresql://user:password@host:5432/db?schema=public
```

If `DATABASE_URL` is not provided, Prisma config can derive it from `DB_USER`, `DB_PASSWORD`, and `DB_NAME` for local runs.

---

## Run the Backend

### Option A: Local (without Docker)

```bash
pnpm install
pnpm prisma generate
pnpm prisma migrate dev
pnpm run start:dev
```

Backend default URL: `http://localhost:3000`

### Option B: Docker Compose (recommended for full environment)

From project root (`/main`):

```bash
docker compose up -d --build
```

This starts:
- PostgreSQL container (`db`)
- Backend container (`backend`)

At startup, backend runs migrations (`prisma migrate deploy`) before launching app.

---

## API Documentation (Swagger)

Swagger UI is available at:

`http://localhost:3000/api/docs`

Use the **Authorize** button and paste:

```text
Bearer <your_access_token>
```

---

## REST API Endpoints

### Auth

#### `POST /auth/register`
Register new user.

Request body:

```json
{
  "email": "admin@example.com",
  "password": "123456",
  "role": "ADMIN"
}
```

#### `POST /auth/login`
Authenticate user and return JWT.

Request body:

```json
{
  "email": "admin@example.com",
  "password": "123456"
}
```

Response:

```json
{
  "access_token": "...",
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "role": "ADMIN"
  }
}
```

---

### Categories

- `POST /categories` (JWT + `ADMIN`)
- `GET /categories` (public)
- `GET /categories/:id` (public)
- `PATCH /categories/:id` (JWT)
- `DELETE /categories/:id` (JWT)

---

### Products

- `POST /products` (JWT + `ADMIN`)
- `GET /products` (public; supports `skip`, `take`, `categoryId`)
- `GET /products/:id` (public)
- `PATCH /products/:id` (JWT)
- `DELETE /products/:id` (JWT)

Example:

`GET /products?skip=0&take=10&categoryId=1`

---

### Inventory

- `POST /inventory/move` (JWT)
- `GET /inventory/transactions` (public)

`/inventory/move` body example:

```json
{
  "productId": 1,
  "amount": 10,
  "type": "IN",
  "comment": "Restock shipment"
}
```

`type` rules:
- `IN` → increase product quantity
- `OUT` → decrease quantity (fails if not enough stock)
- `ADJUST` → set exact quantity

---

## Validation, Error Handling, and CORS

### Validation

Global `ValidationPipe` is enabled with:
- `whitelist: true` (unknown fields stripped)
- `transform: true` (query/body values transformed to DTO types)

### Common error responses

- `400` validation/business errors
- `401` missing/invalid JWT
- `403` role denied by RBAC
- `404` entity not found
- `409` conflict (e.g. duplicate email/category)

### CORS

Allowed origins include:
- `http://localhost:5173`
- `http://127.0.0.1:5173`
- optional `FRONTEND_URL` env value

Credentials are enabled.

---

## Scripts

Available in `backend/package.json`:

```bash
pnpm run start        # start app
pnpm run start:dev    # start in watch mode
pnpm run start:prod   # run compiled app
pnpm run build        # compile TypeScript
pnpm run lint         # eslint
pnpm run test         # unit tests
pnpm run test:e2e     # e2e tests
pnpm run test:cov     # coverage
```

---

## Known Notes

- `POST /categories` and `POST /products` are intentionally admin-protected.
- Frontend must send JWT in `Authorization` header for protected routes.
- If tables are missing, ensure migrations were applied (`prisma migrate dev` locally or `migrate deploy` in Docker).

---

If you want, the next improvement can be a dedicated **API versioning section** (`/v1`) and a complete **OpenAPI request/response contract table** for every endpoint.
