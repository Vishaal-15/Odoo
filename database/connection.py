import logging
from typing import Generator, Dict, Any
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from sqlalchemy.pool import QueuePool
from database.config import settings

logger = logging.getLogger("database")

# Declarative Base for all SQLAlchemy models
Base = declarative_base()

# Hardened Synchronous Engine
engine = create_engine(
    settings.sync_database_url,
    poolclass=QueuePool,
    pool_pre_ping=settings.DB_POOL_PRE_PING,
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
    pool_timeout=settings.DB_POOL_TIMEOUT,
    pool_recycle=settings.DB_POOL_RECYCLE,
    connect_args={
        "connect_timeout": 10,
        "application_name": "dayflow_hrms_db",
    },
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


def get_pool_status() -> Dict[str, Any]:
    """Returns runtime metrics on the SQLAlchemy connection pool."""
    pool = engine.pool
    return {
        "pool_size": pool.size(),
        "checked_in_connections": pool.checkedin(),
        "checked_out_connections": pool.checkedout(),
        "overflow_connections": pool.overflow(),
        "pool_timeout": settings.DB_POOL_TIMEOUT,
        "pool_recycle": settings.DB_POOL_RECYCLE,
    }


def init_db():
    """Initializes tables directly using metadata (for tests/fallback)."""
    import database.models  # noqa: F401
    Base.metadata.create_all(bind=engine)


def drop_db():
    """Drops all tables (use with caution during development/testing)."""
    import database.models  # noqa: F401
    Base.metadata.drop_all(bind=engine)
