import logging
from typing import Generator
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from database.config import settings

logger = logging.getLogger("database")

# Declarative Base for all SQLAlchemy models
Base = declarative_base()

# Synchronous Engine (psycopg2 / standard driver)
engine = create_engine(
    settings.sync_database_url,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    future=True,
)

# Session factory for synchronous operations
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    future=True,
)


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that provides a SQLAlchemy database session.
    Closes the session cleanly upon request completion.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_connection() -> bool:
    """Tests if the database connection is healthy."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception as e:
        logger.error(f"Database connection check failed: {e}")
        return False


def init_db():
    """Initializes tables directly using metadata (for tests/fallback)."""
    # Import all models to ensure they are registered with Base.metadata
    import database.models  # noqa: F401
    Base.metadata.create_all(bind=engine)


def drop_db():
    """Drops all tables (use with caution during development/testing)."""
    import database.models  # noqa: F401
    Base.metadata.drop_all(bind=engine)
