"""Docker startup: wait for PostgreSQL, initialize backend schema, seed team data, run API."""
import os
import subprocess
import sys
import time

from sqlalchemy import inspect, text

from app.core.database import Base, engine, SessionLocal
from app.core.seed import seed_default_data

# Ensure all models are registered before create_all
import app.models  # noqa: F401


def wait_for_database(max_attempts: int = 40, delay_seconds: int = 2) -> None:
    for attempt in range(1, max_attempts + 1):
        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            print("[docker-entrypoint] Database is ready.")
            return
        except Exception as exc:
            print(f"[docker-entrypoint] Waiting for database ({attempt}/{max_attempts}): {exc}")
            time.sleep(delay_seconds)
    raise RuntimeError("Database did not become ready in time.")


def ensure_backend_schema() -> None:
    Base.metadata.create_all(bind=engine)
    print("[docker-entrypoint] Ensuring all backend tables and columns exist...")

    # Auto-add missing columns to employee_profiles table
    with engine.begin() as conn:
        columns_to_add = [
            ("company_name", "VARCHAR(100) DEFAULT 'Odoo India'"),
            ("manager_name", "VARCHAR(100)"),
            ("location", "VARCHAR(100) DEFAULT 'Bangalore Office'"),
            ("about", "TEXT"),
            ("what_i_love", "TEXT"),
            ("interests_and_hobbies", "TEXT"),
            ("skills", "TEXT"),
            ("certifications", "TEXT"),
            ("date_of_birth", "DATE"),
            ("nationality", "VARCHAR(50) DEFAULT 'Indian'"),
            ("personal_email", "VARCHAR(255)"),
            ("gender", "VARCHAR(20) DEFAULT 'Male'"),
            ("marital_status", "VARCHAR(20) DEFAULT 'Single'"),
            ("bank_name", "VARCHAR(100) DEFAULT 'HDFC Bank'"),
            ("account_number", "VARCHAR(50)"),
            ("ifsc_code", "VARCHAR(30)"),
            ("pan_no", "VARCHAR(30)"),
            ("uan_no", "VARCHAR(30)"),
        ]
        for col_name, col_def in columns_to_add:
            try:
                conn.execute(text(f"ALTER TABLE employee_profiles ADD COLUMN IF NOT EXISTS {col_name} {col_def}"))
            except Exception as e:
                print(f"[docker-entrypoint] Column migration {col_name}: {e}")

    print("[docker-entrypoint] Schema sync completed.")


def seed_if_needed() -> None:
    db = SessionLocal()
    try:
        from app.models.user import User

        count = db.query(User).count()
        has_new_odoo_format = db.query(User).filter(User.employee_id.like("OI%")).count() > 0
    finally:
        db.close()

    if count == 0 or not has_new_odoo_format:
        print("[docker-entrypoint] Seeding updated Odoo team accounts and records...")
        seed_default_data(force=True)
    else:
        print(f"[docker-entrypoint] Database populated with Odoo IDs ({count} users). Skipping seed.")



def main() -> None:
    wait_for_database()
    ensure_backend_schema()
    seed_if_needed()

    host = os.getenv("UVICORN_HOST", "0.0.0.0")
    port = os.getenv("UVICORN_PORT", "8000")
    cmd = [
        sys.executable,
        "-m",
        "uvicorn",
        "app.main:app",
        "--host",
        host,
        "--port",
        port,
    ]
    if os.getenv("UVICORN_RELOAD", "false").lower() in ("1", "true", "yes"):
        cmd.append("--reload")

    print(f"[docker-entrypoint] Starting API: {' '.join(cmd)}")
    subprocess.run(cmd, check=True)


if __name__ == "__main__":
    main()
