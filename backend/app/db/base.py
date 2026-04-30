"""Database base declarations."""

from sqlalchemy.orm import declarative_base

Base = declarative_base()

# Import models so metadata knows all mapped tables before create_all.
from app.models import user, user_skill  # noqa: E402,F401
