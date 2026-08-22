import os
from pathlib import Path
from typing import Optional

try:
    from dotenv import load_dotenv
    # Load .env from project root if it exists
    env_path = Path(__file__).resolve().parent.parent / ".env"
    load_dotenv(dotenv_path=env_path)
except ImportError:
    pass


class DatabaseSettings:
    """Database configuration settings loaded from environment variables."""

    POSTGRES_SERVER: str = os.getenv("POSTGRES_SERVER", "localhost")
    POSTGRES_PORT: str = os.getenv("POSTGRES_PORT", "5432")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "dayflow_db")
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "dayflow_user")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "dayflow_password")

    @property
    def sync_database_url(self) -> str:
        """Synchronous connection string for Alembic and SQLAlchemy psycopg2."""
        explicit_url = os.getenv("DATABASE_URL")
        if explicit_url:
            return explicit_url
        return (
            f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    @property
    def async_database_url(self) -> str:
        """Asynchronous connection string for asyncpg / FastAPI async engines."""
        explicit_async_url = os.getenv("ASYNC_DATABASE_URL")
        if explicit_async_url:
            return explicit_async_url
        return (
            f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )


settings = DatabaseSettings()
