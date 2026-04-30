"""User model."""

from uuid import uuid4

from sqlalchemy import Column, String

from app.db.base import Base


class User(Base):
	"""User table."""

	__tablename__ = "users"

	id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
	name = Column(String(120), nullable=False)
	email = Column(String(255), unique=True, nullable=False, index=True)
	password = Column(String(255), nullable=False)
