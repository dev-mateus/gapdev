"""Database session configuration."""

from collections.abc import Generator
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings


def _normalize_database_url(raw_url: str) -> str:
	"""Remove connection options that break psycopg2 against Neon poolers."""

	parsed = urlsplit(raw_url)
	if parsed.scheme.startswith("postgres"):
		scheme = "postgresql+psycopg"
		query_items = parse_qsl(parsed.query, keep_blank_values=True)
		query_items = [(key, value) for key, value in query_items if key.lower() != "channel_binding"]
		return urlunsplit((scheme, parsed.netloc, parsed.path, urlencode(query_items), parsed.fragment))

	return raw_url


database_url = _normalize_database_url(settings.database_url)
is_sqlite = database_url.startswith("sqlite")

engine = create_engine(
	database_url,
	pool_pre_ping=True,
	connect_args={"check_same_thread": False} if is_sqlite else {},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
	"""Yield a SQLAlchemy session for a request."""

	db = SessionLocal()
	try:
		yield db
	finally:
		db.close()
