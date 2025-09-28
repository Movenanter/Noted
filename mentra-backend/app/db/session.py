from sqlalchemy import create_engine, event
from sqlalchemy.engine import Engine
from sqlalchemy.orm import sessionmaker
from ..core.config import settings
from contextlib import contextmanager


engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True, future=True)


@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):  # type: ignore[no-redef]
    try:
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.close()
    except Exception:
        # Non-SQLite engines may ignore PRAGMAs
        pass


SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False, future=True)

@contextmanager
def get_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
