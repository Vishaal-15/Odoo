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
    inspector = inspect(engine)
    tables = set(inspector.get_table_names())

    # Backend API uses employee_profiles; Dev 3 schema uses employees instead.
    if "employee_profiles" in tables:
        print("[docker-entrypoint] Backend schema detected.")
        return

    print("[docker-entrypoint] Initializing backend schema for API...")
    with engine.begin() as conn:
        conn.execute(text("DROP SCHEMA IF EXISTS public CASCADE"))
        conn.execute(text("CREATE SCHEMA public"))
        conn.execute(text("GRANT ALL ON SCHEMA public TO public"))

    Base.metadata.create_all(bind=engine)
    print("[docker-entrypoint] Backend tables created.")


def seed_if_needed() -> None:
    db = SessionLocal()
    try:
        from app.models.user import User

        count = db.query(User).count()
    finally:
        db.close()

    if count == 0:
        print("[docker-entrypoint] Seeding hackathon team data...")
        seed_default_data(force=True)
    else:
        print(f"[docker-entrypoint] Database already has {count} users. Skipping seed.")


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
