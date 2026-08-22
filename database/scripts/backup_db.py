"""
Dayflow HRMS - Automated Database Backup Tool
Developer 3: Database + Infrastructure

Creates timestamped compressed SQL backups of the production database
using Docker or local pg_dump, and cleans up backups older than retention days.

Usage:
    python -m database.scripts.backup_db
    or
    python database/scripts/backup_db.py [--retention-days 7]
"""

import sys
import os
import subprocess
import gzip
import shutil
from datetime import datetime
from pathlib import Path

# Ensure root directory is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from database.config import settings


def backup_database(retention_days: int = 7) -> str:
    """Executes a compressed database dump and returns the backup file path."""
    backup_dir = Path(__file__).resolve().parent.parent / "backups"
    backup_dir.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_filename = f"dayflow_db_backup_{timestamp}.sql.gz"
    backup_path = backup_dir / backup_filename
    temp_sql_path = backup_dir / f"temp_{timestamp}.sql"

    print(f"[Dayflow Backup] Initiating backup for database '{settings.POSTGRES_DB}'...")

    # Method 1: Try Docker container execution
    docker_cmd = [
        "docker", "exec", "-t", "dayflow_postgres",
        "pg_dump", "-U", settings.POSTGRES_USER, "-d", settings.POSTGRES_DB, "--clean", "--if-exists"
    ]

    dump_success = False
    try:
        with open(temp_sql_path, "wb") as f:
            proc = subprocess.run(docker_cmd, stdout=f, stderr=subprocess.PIPE, check=True)
        dump_success = True
        print("  [+] Extracted database dump via Docker container.")
    except Exception as e:
        print(f"  [INFO] Docker pg_dump fallback: {e}")

    # Method 2: Fallback to local pg_dump if Docker not directly accessible
    if not dump_success:
        try:
            env = os.environ.copy()
            env["PGPASSWORD"] = settings.POSTGRES_PASSWORD
            local_cmd = [
                "pg_dump",
                "-h", settings.POSTGRES_SERVER,
                "-p", str(settings.POSTGRES_PORT),
                "-U", settings.POSTGRES_USER,
                "-d", settings.POSTGRES_DB,
                "--clean", "--if-exists",
                "-f", str(temp_sql_path),
            ]
            subprocess.run(local_cmd, env=env, check=True, stderr=subprocess.PIPE)
            dump_success = True
            print("  [+] Extracted database dump via local pg_dump.")
        except Exception as e:
            print(f"  [WARN] Local pg_dump failed: {e}")

    if not dump_success or not temp_sql_path.exists() or temp_sql_path.stat().st_size == 0:
        if temp_sql_path.exists():
            temp_sql_path.unlink()
        raise RuntimeError("Failed to create database dump. Ensure Docker container or pg_dump is running.")

    # Compress to .sql.gz
    with open(temp_sql_path, "rb") as f_in:
        with gzip.open(backup_path, "wb") as f_out:
            shutil.copyfileobj(f_in, f_out)

    temp_sql_path.unlink()  # Remove uncompressed temp file
    file_size_kb = backup_path.stat().st_size / 1024
    print(f"  [OK] Compressed backup saved: {backup_path.name} ({file_size_kb:.2f} KB)")

    # Retention Cleanup
    cleanup_old_backups(backup_dir, retention_days)
    return str(backup_path)


def cleanup_old_backups(backup_dir: Path, retention_days: int):
    """Deletes backups older than retention_days."""
    now = datetime.now()
    cleaned = 0
    for f in backup_dir.glob("dayflow_db_backup_*.sql.gz"):
        file_age_days = (now - datetime.fromtimestamp(f.stat().st_mtime)).days
        if file_age_days > retention_days:
            f.unlink()
            cleaned += 1
    if cleaned > 0:
        print(f"  [+] Purged {cleaned} backup file(s) older than {retention_days} days.")


if __name__ == "__main__":
    try:
        path = backup_database()
        print(f"\n[SUCCESS] Backup complete: {path}")
    except Exception as e:
        print(f"\n[ERROR] Backup failed: {e}")
        sys.exit(1)
