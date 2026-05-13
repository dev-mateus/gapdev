"""User skill model."""

from enum import Enum
from uuid import uuid4

from sqlalchemy import Column, Enum as SQLEnum, ForeignKey, String
from sqlalchemy.orm import relationship

from app.db.base import Base


class SkillLevel(str, Enum):
	"""Skill level enum."""
	Beginner = "Beginner"
	Basic = "Basic"
	Intermediate = "Intermediate"
	Advanced = "Advanced"
	Specialist = "Specialist"


class SkillPriority(str, Enum):
	"""Skill priority enum."""
	desirable = "desirable"
	required = "required"


class UserSkill(Base):
    """Skills associated to a user and job."""

    __tablename__ = "user_skills"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
    user_id = Column("userId", String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    job_id = Column(String(36), ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_name = Column("skillName", String(120), nullable=False)
    level = Column(SQLEnum(SkillLevel), nullable=False, default=SkillLevel.Beginner)
    priority = Column(SQLEnum(SkillPriority), nullable=False, default=SkillPriority.desirable)

    user = relationship("User", back_populates="skills")
    job = relationship("Job", back_populates="skills")