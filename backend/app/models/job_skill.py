"""Job skill model."""

from uuid import uuid4

from sqlalchemy import Column, DateTime, Enum as SQLEnum, ForeignKey, String, func
from sqlalchemy.orm import relationship

from app.db.base import Base
from app.models.enums import SkillLevel, SkillPriority


class JobSkill(Base):
	"""Skills inferred for a job analysis."""

	__tablename__ = "job_skills"

	id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
	job_id = Column(String(36), ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False, index=True)
	skill_id = Column(String(36), ForeignKey("skills.id", ondelete="RESTRICT"), nullable=False, index=True)
	raw_name = Column(String(255), nullable=True)
	required_level = Column(SQLEnum(SkillLevel), nullable=False, default=SkillLevel.Basic)
	priority = Column(SQLEnum(SkillPriority), nullable=False, default=SkillPriority.desirable)
	created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

	job = relationship("Job", back_populates="job_skills")
	skill = relationship("Skill", back_populates="job_skills")