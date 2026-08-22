# Dayflow - Human Resource Management System (HRMS)

> *Every workday, perfectly aligned.*

Dayflow HRMS is a comprehensive Human Resource Management System designed to digitize and streamline employee onboarding, profile management, daily/weekly attendance tracking, leave requests with approval workflows, payroll visibility, and intelligent analytics.

---

## 👥 Hackathon Team & Responsibilities

| Role | Responsibility | Tech Stack |
| :--- | :--- | :--- |
| **Developer 1** | **Backend & APIs** | FastAPI, SQLAlchemy 2.0, JWT Auth, Pydantic, Business Logic |
| **Developer 2** | **Frontend & UI** | React, Vite, Modern Dashboard UI, Routing, API Integration |
| **Developer 3** | **Database & Infrastructure** | PostgreSQL 16 (Docker), Alembic, Docker Compose, DB Schema |
| **Developer 4** | **AI & Analytics** | Historical Analytics, Predictive Insights, Background Notifications |

---

## 🚀 Quickstart Guide (Zero Local PostgreSQL Required)

Developers **do NOT need to install PostgreSQL locally**. Everything runs seamlessly via Docker Compose.

### 1. Clone & Configure Environment
```bash
# Pull latest code
git pull origin main

# Create local .env file
cp .env.example .env        # Linux/macOS
copy .env.example .env      # Windows PowerShell/CMD
```

### 2. Start PostgreSQL Container
```bash
# Start PostgreSQL in background
docker compose up -d postgres

# Verify container is healthy
docker ps
```

### 3. Run Database Migrations (Alembic)
```bash
# Apply all schema migrations to PostgreSQL
python -m alembic upgrade head
```

### 4. Seed Development Data
```bash
# Populate database with departments, users, attendance, leaves, and payrolls
python -m database.seed
```

### 5. Verify Setup & Connectivity
```bash
# Run database verification test
python database/scripts/test_connection.py
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
└── database/
    ├── config.py                 # Environment & DB connection configuration
    ├── connection.py             # Engine, SessionLocal, get_db dependency
    ├── init.sql                  # PostgreSQL container initial extensions
    ├── seed.py                   # Idempotent Python development seed script
    ├── seed_data.sql             # Pure SQL development seed script
    ├── models/                   # SQLAlchemy 2.0 ORM Models
    │   ├── __init__.py           # Re-exports all models & enums
    │   ├── enums.py              # Domain enumerations (Roles, Statuses)
    │   ├── user.py               # User authentication accounts
    │   ├── department.py         # Department structure
    │   ├── employee.py           # Employee profile & job details
    │   ├── attendance.py         # Daily attendance & work hours
    │   ├── leave.py              # Leave types & approval requests
    │   ├── payroll.py            # Salary structures & monthly payslips
    │   ├── notification.py       # Notifications & system alerts
    │   └── audit_log.py          # Security & operational audit logs
    ├── migrations/               # Alembic version control
    │   ├── env.py                # Alembic runtime configuration
    │   └── versions/             # Migration revision files
    └── scripts/
        ├── test_connection.py    # Health check & table counts test
        └── reset_db.py           # Complete DB rollback, migrate & reseed
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
