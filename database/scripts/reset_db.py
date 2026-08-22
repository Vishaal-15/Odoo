"""
Dayflow HRMS - Database Reset & Reseed Utility
Developer 3: Database + Infrastructure

Rolls back migrations to base, upgrades to head, and seeds fresh test data.
"""

import sys
import os
import subprocess

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))


def reset_and_seed():
    print("[Dayflow Reset] Resetting database schema and reseeding test data...")

    print("1. Downgrading migrations to base...")
    res = subprocess.run([sys.executable, "-m", "alembic", "downgrade", "base"], check=False)
    if res.returncode != 0:
        print("[!] Downgrade failed or was already clean.")

    print("2. Upgrading migrations to head...")
    subprocess.run([sys.executable, "-m", "alembic", "upgrade", "head"], check=True)

    print("3. Seeding development data...")
    from database.seed import seed_database
    seed_database()

    print("\n[Dayflow Reset] Complete! Database is fresh, migrated, and seeded.")


if __name__ == "__main__":
    reset_and_seed()
