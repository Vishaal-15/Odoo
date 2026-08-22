# Dayflow - Human Resource Management System (HRMS)

> *Every workday, perfectly aligned.*

Dayflow HRMS is a modern, modular, and collaborative enterprise Human Resource Management System built for streamlined workforce operations, onboarding, attendance tracking, leave workflows, payroll visibility, and real-time notifications.

---

## 👥 Team Responsibilities & Architecture

| Role | Domain | Responsibilities |
|---|---|---|
| **Developer 1 (You)** | **Backend** | FastAPI, SQLAlchemy, JWT Authentication, RBAC, Core Business Logic & Endpoints, Testing |
| **Developer 2** | **Frontend** | React, Vite, Modern Dashboard UI, Routing, Responsive Design & API Integration |
| **Developer 3** | **Database & Infra** | PostgreSQL, Alembic Migrations, Docker Compose, Database Optimization |
| **Developer 4** | **AI & Integration** | Analytics Dashboard, Smart Insights, Background Processing, Notification Services |

---

## 🚀 Quick Start (Backend)

### 1. Prerequisites
- Python 3.10+
- PostgreSQL or SQLite (for local testing)

### 2. Environment Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

### 3. Run the Backend API
```bash
uvicorn app.main:app --reload --port 8000
```
- **API Documentation (Swagger UI)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Alternative Docs (ReDoc)**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

### 4. Running Backend Tests
```bash
pytest backend/tests -v
```

---

## 📂 Project Structure

```
├── .gitignore
├── README.md
├── docs/
│   ├── architecture.md
│   ├── api-contract.md
│   └── database-schema.md
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── core/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── repositories/
│   │   ├── services/
│   │   └── api/
│   │       ├── deps.py
│   │       └── v1/
│   ├── tests/
│   ├── requirements.txt
│   └── .env.example
└── frontend/ (Managed by Developer 2)
```

---

## 🔒 Security & RBAC

The system enforces strict role-based access control (RBAC) across three distinct roles:
- `EMPLOYEE`: Access to own profile, check-in/out, personal leave applications, and view-only personal payroll.
- `HR`: Manage all employee profiles, review and approve/reject leave requests, view organization-wide attendance, and manage payroll.
- `ADMIN`: Full administrative power across system configurations, user roles, payroll structures, and HR approvals.
