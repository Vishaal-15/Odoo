"""
Dayflow HRMS - Database Restore Tool
Developer 3: Database + Infrastructure

Restores a compressed (.sql.gz) or plain (.sql) database backup file.

Usage:
    python -m database.scripts.restore_db <path_to_backup_file>
    or
    python database/scripts/restore_db.py database/backups/dayflow_db_backup_xxxx.sql.gz
"""

import sys
import os
import subprocess
import gzip
import shutil
from pathlib import Path

# Ensure root directory is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from database.config import settings


def restore_database(backup_file_path: str):
    """Restores database from a given SQL or SQL.GZ backup archive."""
    b_path = Path(backup_file_path).resolve()
    if not b_path.exists():
        raise FileNotFoundError(f"Backup file not found: {b_path}")

    print(f"[Dayflow Restore] Preparing to restore from: {b_path.name}")
    temp_sql = b_path.parent / f"temp_restore_{b_path.stem}.sql"

    # Uncompress if needed
    if b_path.suffix == ".gz":
        with gzip.open(b_path, "rb") as f_in:
            with open(temp_sql, "wb") as f_out:
                shutil.copyfileobj(f_in, f_out)
        sql_to_execute = temp_sql
    else:
        sql_to_execute = b_path

    restored = False
    try:
        # Method 1: Docker psql
        print("  [+] Attempting restore via Docker container...")
        with open(sql_to_execute, "rb") as sql_f:
            docker_cmd = [
                "docker", "exec", "-i", "dayflow_postgres",
                "psql", "-U", settings.POSTGRES_USER, "-d", settings.POSTGRES_DB
            ]
            subprocess.run(docker_cmd, stdin=sql_f, check=True, stderr=subprocess.PIPE)
        restored = True
        print("  [OK] Successfully restored via Docker container.")
    except Exception as e:
        print(f"  [INFO] Docker restore fallback: {e}")

    # Method 2: Local psql fallback
    if not restored:
        try:
            print("  [+] Attempting restore via local psql...")
            env = os.environ.copy()
            env["PGPASSWORD"] = settings.POSTGRES_PASSWORD
            with open(sql_to_execute, "rb") as sql_f:
                local_cmd = [
                    "psql",
                    "-h", settings.POSTGRES_SERVER,
                    "-p", str(settings.POSTGRES_PORT),
                    "-U", settings.POSTGRES_USER,
                    "-d", settings.POSTGRES_DB,
                ]
                subprocess.run(local_cmd, stdin=sql_f, env=env, check=True, stderr=subprocess.PIPE)
            restored = True
            print("  [OK] Successfully restored via local psql.")
        except Exception as e:
            print(f"  [WARN] Local psql restore failed: {e}")

    # Clean up temp uncompressed file
    if temp_sql.exists():
        temp_sql.unlink()

    if not restored:
        raise RuntimeError("Failed to restore database. Check logs and connection settings.")

    print(f"[Dayflow Restore] Database '{settings.POSTGRES_DB}' restored successfully!")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python database/scripts/restore_db.py <path_to_backup_file.sql.gz>")
        sys.exit(1)
    try:
        restore_database(sys.argv[1])
    except Exception as e:
        print(f"\n[ERROR] Restore failed: {e}")
        sys.exit(1)
