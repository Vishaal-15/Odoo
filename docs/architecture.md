# Dayflow HRMS - System Architecture

## 1. High-Level Architecture

Dayflow HRMS uses a layered modular monolith architecture designed for clean separation of concerns, high testability, and seamless multi-developer collaboration.

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer                           │
│           (React Single Page App / Dev 2)                   │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / JSON REST API
┌──────────────────────────────▼──────────────────────────────┐
│                    FastAPI Backend (Dev 1)                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    API Routing Layer                  │  │
│  │     (/api/v1/auth, /employees, /attendance, etc.)     │  │
│  └───────────────────────────┬───────────────────────────┘  │
│  ┌───────────────────────────▼───────────────────────────┐  │
│  │                RBAC & Auth Middleware Layer           │  │
│  │    (JWT Bearer, OAuth2 Password Bearer, Role Guards)  │  │
│  └───────────────────────────┬───────────────────────────┘  │
│  ┌───────────────────────────▼───────────────────────────┐  │
│  │                  Business Logic Services              │  │
│  │ (AuthService, LeaveService, AttendanceService, etc.)  │  │
│  └───────────────────────────┬───────────────────────────┘  │
│  ┌───────────────────────────▼───────────────────────────┐  │
│  │                    Repository Layer                   │  │
│  │           (CRUD & Query Abstractions with ORM)        │  │
│  └───────────────────────────┬───────────────────────────┘  │
│  ┌───────────────────────────▼───────────────────────────┐  │
│  │                 SQLAlchemy ORM Models                 │  │
│  └───────────────────────────┬───────────────────────────┘  │
└──────────────────────────────┼──────────────────────────────┘
                               │ SQLAlchemy / asyncpg / psycopg2
┌──────────────────────────────▼──────────────────────────────┐
│              Database & Infrastructure (Dev 3)              │
│                 (PostgreSQL + Alembic Migrations)           │
└─────────────────────────────────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│             AI, Background & Analytics (Dev 4)              │
│       (Analytics Hooks, Insights & Notification Workers)    │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Backend Layer Breakdown

### A. API Layer (`backend/app/api/`)
- Handles incoming HTTP requests and serialization.
- Declares input and output validation via Pydantic schemas.
- Injects dependencies (database sessions, authenticated user context, RBAC validation).

### B. RBAC & Security Layer (`backend/app/api/deps.py`, `backend/app/core/security.py`)
- Passwords stored with cryptographic salts via `bcrypt`.
- Statless JWT (JSON Web Tokens) encoded with HS256 algorithm.
- RBAC guards ensure non-admin users cannot access administrative data or mutate other users' records.

### C. Service Layer (`backend/app/services/`)
- Contains all enterprise business rules:
  - Validating leave dates, avoiding overlapping leaves.
  - Enforcing check-in before check-out, calculating worked hours, preventing multiple daily check-ins.
  - Dispatching internal notifications upon workflow events (leave submission, approval/rejection).

### D. Repository Layer (`backend/app/repositories/`)
- Encapsulates database queries and transactions.
- Provides consistent methods (`get_by_id`, `list`, `create`, `update`, `delete`).

### E. Model Layer (`backend/app/models/`)
- SQLAlchemy declarative Base classes with column types, relationships, foreign keys, and indexes.
