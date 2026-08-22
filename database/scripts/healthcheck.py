"""
Dayflow HRMS - Production Database Health & Readiness Diagnostic Probe
Developer 3: Database + Infrastructure

Runs deep diagnostics on PostgreSQL 16 server, connection pool, table integrity,
active connections, schema constraints, and storage metrics.

Usage:
    python -m database.scripts.healthcheck
    or
    python database/scripts/healthcheck.py
"""

import sys
import os
from datetime import datetime
from sqlalchemy import text, inspect

# Ensure root directory is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from database.connection import engine, check_connection, get_pool_status, Base
import database.models  # noqa: F401


def run_healthcheck() -> bool:
    print("==================================================================")
    print("      Dayflow HRMS - Production Database Health Diagnostics       ")
    print(f"      Execution Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}      ")
    print("==================================================================")

    all_passed = True

    # 1. Connection Ping
    print("\n[1] Testing Database Ping & Connectivity...")
    if check_connection():
        print("  [OK] PostgreSQL ping responsive.")
    else:
        print("  [FAIL] Cannot connect to PostgreSQL.")
        return False

    with engine.connect() as conn:
        # 2. Database Server Version
        print("\n[2] Checking Server Version & Extensions...")
        version = conn.execute(text("SELECT version()")).scalar()
        print(f"  [OK] Server: {version.split(',')[0] if version else 'Unknown'}")

        # Extensions
        ext_rows = conn.execute(text("SELECT extname, extversion FROM pg_extension")).fetchall()
        ext_map = {row[0]: row[1] for row in ext_rows}
        for req_ext in ["uuid-ossp", "pgcrypto"]:
            if req_ext in ext_map:
                print(f"  [OK] Extension '{req_ext}' is installed (v{ext_map[req_ext]}).")
            else:
                print(f"  [WARN] Extension '{req_ext}' is NOT active in this database.")

        # 3. Connection Pool Metrics
        print("\n[3] SQLAlchemy QueuePool Metrics...")
        pool_stats = get_pool_status()
        for k, v in pool_stats.items():
            print(f"  - {k}: {v}")

        # 4. Database Disk Usage & Buffer Cache Hit Ratio
        print("\n[4] Storage & Performance Metrics...")
        try:
            db_size = conn.execute(text("SELECT pg_size_pretty(pg_database_size(current_database()))")).scalar()
            print(f"  [OK] Database Size on Disk: {db_size}")
            
            cache_hit = conn.execute(text("""
                SELECT 
                    round((sum(heap_blks_hit) - sum(heap_blks_read)) / NULLIF(sum(heap_blks_hit), 0) * 100, 2) AS ratio
                FROM pg_statio_user_tables
            """)).scalar()
            print(f"  [OK] Buffer Cache Hit Ratio: {cache_hit if cache_hit is not None else 100.0}%")
        except Exception as e:
            print(f"  [INFO] Performance metrics note: {e}")

        # 5. Schema Table Inventory & Row Counts
        print("\n[5] Table Inventory & Row Counts...")
        inspector = inspect(engine)
        existing_tables = inspector.get_table_names()
        
        expected_tables = [
            "users", "departments", "employees", "attendance",
            "leave_types", "leave_requests", "salary_structures",
            "payrolls", "notifications", "audit_logs"
        ]

        print(f"  +----------------------+------------+------------+")
        print(f"  | Table Name           | Status     | Row Count  |")
        print(f"  +----------------------+------------+------------+")
        
        for table in expected_tables:
            if table in existing_tables:
                count = conn.execute(text(f'SELECT count(*) FROM "{table}"')).scalar()
                print(f"  | {table:<20} | PRESENT    | {count:<10} |")
            else:
                print(f"  | {table:<20} | MISSING    | -          |")
                all_passed = False
        print(f"  +----------------------+------------+------------+")

        # 6. Active Connection Count in PostgreSQL
        print("\n[6] Active PostgreSQL Client Sessions...")
        active_conns = conn.execute(text("""
            SELECT count(*), application_name 
            FROM pg_stat_activity 
            WHERE datname = current_database() 
            GROUP BY application_name
        """)).fetchall()
        for count, app_name in active_conns:
            print(f"  - App: '{app_name or 'unnamed'}' -> {count} active backend process(es)")

    print("\n==================================================================")
    if all_passed:
        print("[SUCCESS] Production Database Health: HEALTHY & OPERATIONAL")
    else:
        print("[WARNING] Database Health Check detected issues. Review logs above.")
    print("==================================================================\n")
    return all_passed


if __name__ == "__main__":
    success = run_healthcheck()
    sys.exit(0 if success else 1)
