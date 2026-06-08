"""Skill model."""

from uuid import uuid4

from sqlalchemy import Boolean, Column, DateTime, String, Text, func
from sqlalchemy.orm import relationship

from app.db.base import Base


class Skill(Base):
	"""Canonical skill catalog entry."""

	__tablename__ = "skills"

	id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
	canonical_name = Column("canonical_name", String(255), nullable=False)
	slug = Column(String(255), unique=True, nullable=False, index=True)
	category = Column(String(120), nullable=True)
	description = Column(Text, nullable=True)
	active = Column(Boolean, nullable=False, default=True)
	created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
	updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

	aliases = relationship("SkillAlias", back_populates="skill")
	user_skills = relationship("UserSkill", back_populates="skill")
	job_skills = relationship("JobSkill", back_populates="skill")
	study_items = relationship("StudyPlanItem", back_populates="skill")
	study_item_skills = relationship("StudyPlanItemSkill", back_populates="skill")
