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
    """Production-hardened database configuration settings."""

    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    # PostgreSQL Connection Parameters
    POSTGRES_SERVER: str = os.getenv("POSTGRES_SERVER", "localhost")
    POSTGRES_PORT: str = os.getenv("POSTGRES_PORT", "5432")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "dayflow_db")
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "dayflow_user")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "dayflow_password")

    # Connection Pooling Parameters
    DB_POOL_SIZE: int = int(os.getenv("DB_POOL_SIZE", "20" if os.getenv("ENVIRONMENT") == "production" else "10"))
    DB_MAX_OVERFLOW: int = int(os.getenv("DB_MAX_OVERFLOW", "30" if os.getenv("ENVIRONMENT") == "production" else "20"))
    DB_POOL_TIMEOUT: int = int(os.getenv("DB_POOL_TIMEOUT", "30"))
    DB_POOL_RECYCLE: int = int(os.getenv("DB_POOL_RECYCLE", "1800"))  # Recycle connections every 30 minutes
    DB_POOL_PRE_PING: bool = os.getenv("DB_POOL_PRE_PING", "true").lower() in ("true", "1", "yes")

    # Security & SSL
    DB_SSL_MODE: Optional[str] = os.getenv("DB_SSL_MODE", None)  # e.g., 'require', 'verify-full'

    @property
    def sync_database_url(self) -> str:
        """Synchronous connection string for Alembic and SQLAlchemy psycopg2."""
        explicit_url = os.getenv("DATABASE_URL")
        if explicit_url:
            return explicit_url
        
        ssl_suffix = f"?sslmode={self.DB_SSL_MODE}" if self.DB_SSL_MODE else ""
        return (
            f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}{ssl_suffix}"
        )

    @property
    def async_database_url(self) -> str:
        """Asynchronous connection string for asyncpg / FastAPI async engines."""
        explicit_async_url = os.getenv("ASYNC_DATABASE_URL")
        if explicit_async_url:
            return explicit_async_url
        
        ssl_suffix = f"?ssl={self.DB_SSL_MODE}" if self.DB_SSL_MODE else ""
        return (
            f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}{ssl_suffix}"
        )


settings = DatabaseSettings()
