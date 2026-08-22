# Dayflow - Human Resource Management System (HRMS)

> *Every workday, perfectly aligned.*

Dayflow HRMS is an enterprise-grade Human Resource Management System designed to digitize and streamline employee onboarding, profile management, daily/weekly attendance tracking, leave requests with approval workflows, payroll visibility, and intelligent analytics.

---

## 👥 Hackathon Team & Responsibilities

| Role | Domain | Tech Stack & Scope |
| :--- | :--- | :--- |
| **Developer 1** | **Backend** | FastAPI, SQLAlchemy 2.0, JWT Authentication, RBAC, Core APIs, Testing |
| **Developer 2** | **Frontend** | React, Vite, Modern Dashboard UI, Routing, Responsive Design, API Integration |
| **Developer 3** | **Database & Infra** | PostgreSQL 16 (Docker), Alembic Migrations, Docker Compose, DB Optimization, Production Tooling |
| **Developer 4 (Your Stack)** | **Analytics & Reports** | Real-Time Analytics, Corporate Reports, Notification Integration, Cross-Module E2E Testing |

---

## 🚀 Quickstart Guide

### 1. Database & Infrastructure Setup (Zero Local PostgreSQL Required)
```bash
# Pull latest code
git pull origin main

# Create local .env file
cp .env.example .env        # Linux/macOS
copy .env.example .env      # Windows PowerShell/CMD

# Start PostgreSQL Container via Docker
docker compose up -d postgres

# Apply Alembic Migrations
python -m alembic upgrade head

# Seed Initial Development Data
python -m database.seed
```

### 2. Run the Full Backend Integration Test Suite (65/65 Tests)
```bash
pytest backend/tests -v
```

### 3. Run the Frontend Test Suite (9/9 Tests)
```bash
cd frontend
npm test
```

### 4. Run the FastAPI Backend
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
# source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
- **Interactive Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc UI**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

### 5. Run the React + Vite Frontend
```bash
cd frontend
npm install
npm run dev
```
- **Web App**: [http://localhost:5173](http://localhost:5173)

---

## 🔑 Development Test Credentials

The database comes pre-seeded with realistic test accounts:

| Email | Password | Role | Employee Name & Designation |
| :--- | :--- | :--- | :--- |
| `admin@dayflow.com` | `Admin@123` | `ADMIN` | **Senthil** (Chief Technology Officer / Administrator) |
| `hr@dayflow.com` | `Hr@123` | `HR` | **Kanagaraj** (Lead HR Officer) |
| `vishaal@dayflow.com` | `Employee@123` | `EMPLOYEE` | **Vishaal** (Senior Full-Stack Engineer) |
| `saaral@dayflow.com` | `Employee@123` | `EMPLOYEE` | **Saaral** (Product UI/UX Designer) |
| `sharan@dayflow.com` | `Employee@123` | `EMPLOYEE` | **Sharan** (Senior Marketing Strategist) |
| `sreevanth@dayflow.com` | `Employee@123` | `EMPLOYEE` | **Sreevanth** (Lead Financial Analyst) |

---

## 🔒 Security & Role-Based Access Control (RBAC)

The system enforces strict role-based access control (RBAC) across three distinct roles:
- `EMPLOYEE`: Access to own profile, check-in/out, personal leave applications, and view-only personal payroll.
- `HR`: Manage all employee profiles, review and approve/reject leave requests, view organization-wide attendance, and manage payroll.
- `ADMIN`: Full administrative power across system configurations, user roles, payroll structures, and HR approvals.

---

## 🏗 Repository Structure (Database + Infrastructure)

```
odoo/
├── .env.example                  # Environment variable configuration template
├── .gitignore
├── alembic.ini                   # Alembic database migration config
├── docker-compose.yml            # Local development Docker compose
├── docker-compose.prod.yml       # Production-hardened Docker compose
├── docs/
│   ├── database-schema.md        # Database schema specifications & ER diagrams
│   ├── architecture.md           # System architecture & container network
│   └── api-contract.md           # REST API endpoint reference
└── database/                     # Database & Infrastructure (Developer 3)
    ├── config.py                 # Environment & DB connection configuration
    ├── connection.py             # Engine, QueuePool, get_db dependency, diagnostics
    ├── init.sql                  # PostgreSQL container initial extensions
    ├── seed.py                   # Idempotent Python development seed script
    ├── seed_data.sql             # Pure SQL development seed script
    ├── models/                   # SQLAlchemy 2.0 ORM Models & Check Constraints
    │   ├── enums.py              # Role, status, and notification enums
    │   ├── user.py               # User authentication model
    │   ├── department.py         # Department organizational model
    │   ├── employee.py           # Employee profile and document model
    │   ├── attendance.py         # Daily attendance with work-hour constraints
    │   ├── leave.py              # LeaveType and LeaveRequest models
    │   ├── payroll.py            # SalaryStructure and Payroll slip models
    │   ├── notification.py       # Notification dispatch model
    │   └── audit_log.py          # Security audit trail log model
    ├── migrations/               # Alembic version control
    ├── backups/                  # Automated gzip database backups
    └── scripts/                  # DB management, verification & backup scripts
        ├── healthcheck.py        # Production health & readiness probe
        ├── test_e2e_production.py# 10-scenario end-to-end production test suite
        ├── test_connection.py    # Baseline connectivity test
        ├── reset_db.py           # Database rollback, migration, and re-seed
        ├── backup_db.py          # Automated compressed database backup
        └── restore_db.py         # Safe database restore tool
```

---

## 🛠 Useful Infrastructure & Production Commands

### 1. Run Health Diagnostics
```bash
python database/scripts/healthcheck.py
```

### 2. Run Comprehensive End-to-End Test Suite
```bash
python database/scripts/test_e2e_production.py
```

### 3. Create Automated Database Backup
```bash
python database/scripts/backup_db.py
```

### 4. Restore Database from Backup
```bash
python database/scripts/restore_db.py database/backups/dayflow_db_backup_<timestamp>.sql.gz
```

### 5. Reset & Reseed Database
```bash
python database/scripts/reset_db.py
```

### 6. Start Production Docker Stack
```bash
docker compose -f docker-compose.prod.yml up -d
```

### 7. Optional: Launch Adminer (Web Database UI)
```bash
docker compose --profile tools up -d adminer
# Access at http://localhost:8080 (System: PostgreSQL, Server: postgres, DB: dayflow_db)
```

---

## 📜 Documentation Reference
- [Database Schema Specification](file:///docs/database-schema.md)
- [System Architecture](file:///docs/architecture.md)
- [API Contract & Endpoints](file:///docs/api-contract.md)
