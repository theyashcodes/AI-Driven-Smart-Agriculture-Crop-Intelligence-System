import os
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, declarative_base
from .core.config import settings

# --- SQLite for local dev, PostgreSQL for production ---
_db_url = settings.DATABASE_URL
if not _db_url:
    _db_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    _db_url = f"sqlite:///{os.path.join(_db_dir, 'agri_local.db')}"

connect_args = {}
if _db_url.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(_db_url, connect_args=connect_args)

# Enable WAL mode for SQLite
if _db_url.startswith("sqlite"):
    @event.listens_for(engine, "connect")
    def _set_sqlite_pragma(dbapi_conn, connection_record):
        cursor = dbapi_conn.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- MongoDB Setup (optional – works without it) ---
class _MockCollection:
    """Stub so the app boots even without MongoDB."""
    async def insert_one(self, *a, **kw): return None
    async def find(self, *a, **kw): return []
    async def find_one(self, *a, sort=None, **kw): return None

try:
    if settings.MONGO_URL:
        from motor.motor_asyncio import AsyncIOMotorClient
        mongo_client = AsyncIOMotorClient(settings.MONGO_URL)
        mongo_db = mongo_client[settings.MONGO_DB]
        sensor_collection = mongo_db.get_collection("sensor_data")
    else:
        raise ValueError("No MONGO_URL")
except Exception:
    sensor_collection = _MockCollection()
