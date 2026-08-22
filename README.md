# Dayflow - Human Resource Management System (HRMS)

> *Every workday, perfectly aligned.*

Dayflow HRMS is an enterprise-grade Human Resource Management System designed to digitize and streamline employee onboarding, profile management, daily/weekly attendance tracking, leave requests with approval workflows, payroll visibility, and intelligent analytics.

---

## 👥 Hackathon Team & Responsibilities

| Role | Domain | Tech Stack & Scope |
| :--- | :--- | :--- |
| **Developer 1** | **Backend** | FastAPI, SQLAlchemy 2.0, JWT Authentication, RBAC, Core APIs, Testing |
| **Developer 2** | **Frontend** | React, Vite, Modern Dashboard UI, Routing, Responsive Design, API Integration |
| **Developer 3** | **Database & Infra** | PostgreSQL 16 (Docker), Alembic Migrations, Docker Compose, DB Optimization |
| **Developer 4** | **AI & Analytics** | Historical Analytics, Predictive Insights, Notifications, Background Processing |

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

### 2. Run the FastAPI Backend
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

- **Interactive API Docs (Swagger UI)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Alternative Docs (ReDoc)**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

### 3. Run Backend Test Suite
```bash
pytest backend/tests -v
```

---

## 🔑 Development Test Credentials

The database comes pre-seeded with realistic test accounts:

| Email | Password | Role | Designation |
| :--- | :--- | :--- | :--- |
| `admin@dayflow.com` | `Admin@123` | `ADMIN` | Chief Technology Officer / Administrator |
| `hr@dayflow.com` | `Hr@123` | `HR` | Lead HR Officer |
| `alex.morgan@dayflow.com` | `Employee@123` | `EMPLOYEE` | Senior Full-Stack Engineer |
| `david.kim@dayflow.com` | `Employee@123` | `EMPLOYEE` | Product UI/UX Designer |
| `emily.watson@dayflow.com` | `Employee@123` | `EMPLOYEE` | Senior Marketing Strategist |
| `james.miller@dayflow.com` | `Employee@123` | `EMPLOYEE` | Lead Financial Analyst |

---

## 🔒 Security & Role-Based Access Control (RBAC)

The system enforces strict role-based access control (RBAC) across three distinct roles:
- `EMPLOYEE`: Access to own profile, check-in/out, personal leave applications, and view-only personal payroll.
- `HR`: Manage all employee profiles, review and approve/reject leave requests, view organization-wide attendance, and manage payroll.
- `ADMIN`: Full administrative power across system configurations, user roles, payroll structures, and HR approvals.

---

## 📁 Repository Structure

```text
odoo/
├── .env.example                  # Environment variable template
├── .gitignore                    # Git ignore configuration
├── docker-compose.yml            # PostgreSQL & container services
├── alembic.ini                   # Alembic migration configuration
├── README.md                     # Main project guide
├── docs/
│   ├── database-schema.md        # Complete DB schema, constraints & indexes
│   ├── architecture.md           # System topology & container network
│   └── api-contract.md           # REST API endpoint reference
├── database/                     # Database & Infrastructure (Dev 3)
│   ├── config.py                 # Environment & DB connection configuration
│   ├── connection.py             # Engine, SessionLocal, get_db dependency
│   ├── init.sql                  # PostgreSQL container initial extensions
│   ├── seed.py                   # Idempotent Python development seed script
│   ├── seed_data.sql             # Pure SQL development seed script
│   ├── models/                   # SQLAlchemy 2.0 ORM Models
│   ├── migrations/               # Alembic version control
│   └── scripts/                  # DB management & test scripts
├── backend/                      # FastAPI Backend (Dev 1)
│   ├── app/
│   │   ├── main.py
│   │   ├── core/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── repositories/
│   │   ├── services/
│   │   └── api/
│   └── tests/
└── frontend/                     # React Frontend (Dev 2)
```

---

## 🛠 Useful Infrastructure Commands

### Reset & Reseed Database
```bash
python database/scripts/reset_db.py
```

### Generate a New Alembic Migration
```bash
python -m alembic revision --autogenerate -m "describe_changes"
```

### Optional: Launch Adminer (Web-based Database UI)
```bash
docker compose --profile tools up -d adminer
# Access Adminer at http://localhost:8080 (System: PostgreSQL, Server: postgres, DB: dayflow_db)
```

### Stop Database Container
```bash
docker compose down
```

---

## 📜 Documentation Reference
- [Database Schema Specification](file:///docs/database-schema.md)
- [System Architecture](file:///docs/architecture.md)
- [API Contract & Endpoints](file:///docs/api-contract.md)
