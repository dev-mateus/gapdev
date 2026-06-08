"""User model."""

from uuid import uuid4

from sqlalchemy import Boolean, Column, String
from sqlalchemy.orm import relationship

from app.db.base import Base


class User(Base):
	"""User table."""

	__tablename__ = "users"

	id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
	name = Column(String(120), nullable=False)
	email = Column(String(255), unique=True, nullable=False, index=True)
	password = Column(String(255), nullable=False)
	auth_provider = Column(String(30), nullable=False, default="credentials")
	has_password = Column(Boolean, nullable=False, default=True)
	
	jobs = relationship("Job", back_populates="user", cascade="all, delete-orphan")
	skills = relationship("UserSkill", back_populates="user", cascade="all, delete-orphan")
	study_plans = relationship("StudyPlan", back_populates="user", cascade="all, delete-orphan")
