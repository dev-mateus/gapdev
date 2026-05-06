"""Job model."""

from uuid import uuid4

from sqlalchemy import Column, DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import relationship

from app.db.base import Base


class Job(Base):
	"""Analyzed jobs stored for a user."""

	__tablename__ = "jobs"

	id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
	user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
	company_name = Column(String(255), nullable=False)
	job_title = Column(String(255), nullable=False)
	description = Column(Text, nullable=False)
	created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

	user = relationship("User", back_populates="jobs")
