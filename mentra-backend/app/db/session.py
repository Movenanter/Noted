from __future__ import annotations

from sqlalchemy import create_engine, event, text
from sqlalchemy.orm import sessionmaker
from ..core.config import settings
from .base import Base
from contextlib import contextmanager


# Create SQLAlchemy engine
engine = create_engine(
    settings.DATABASE_URL,
    echo=False,
    future=True,
    pool_pre_ping=True,
    connect_args={"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {},
)


# Enable useful SQLite PRAGMAs in dev/test
if settings.DATABASE_URL.startswith("sqlite"):
    @event.listens_for(engine, "connect")
    def _set_sqlite_pragma(dbapi_connection, connection_record):  # type: ignore[no-redef]
        cursor = dbapi_connection.cursor()
        try:
            cursor.execute("PRAGMA foreign_keys=ON")
            cursor.execute("PRAGMA journal_mode=WAL")
        finally:
            cursor.close()


# Session factory
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False, future=True)


# FastAPI dependency helper
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Context manager for ad-hoc usage outside of FastAPI dependency injection
@contextmanager
def get_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# For tests/dev: ensure metadata tables exist early (idempotent)
try:
    # Import models so they are registered with Base.metadata
    from app.models import entities as _entities  # noqa: F401
    Base.metadata.create_all(bind=engine)
except Exception:
    # During certain tooling/import orders this can run before app package is set up;
    # the FastAPI startup in app.main will create tables as a fallback.
    pass
