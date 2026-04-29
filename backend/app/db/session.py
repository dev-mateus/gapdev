"""Database session configuration."""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings


is_sqlite = settings.database_url.startswith("sqlite")

engine = create_engine(
	settings.database_url,
	pool_pre_ping=True,
	connect_args={"check_same_thread": False} if is_sqlite else {},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
