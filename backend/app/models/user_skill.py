"""User skill model."""

from uuid import uuid4

from sqlalchemy import Boolean, Column, Enum as SQLEnum, ForeignKey, String
from sqlalchemy.orm import relationship

from app.db.base import Base
from app.models.enums import SkillLevel


class UserSkill(Base):
	"""Skills associated to a user."""

	__tablename__ = "user_skills"

	id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
	user_id = Column("user_id", String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
	skill_id = Column("skill_id", String(36), ForeignKey("skills.id", ondelete="RESTRICT"), nullable=False, index=True)
	level = Column(SQLEnum(SkillLevel), nullable=False, default=SkillLevel.Beginner)
	module_badge_seen = Column(Boolean, nullable=False, default=False, server_default="0")

	user = relationship("User", back_populates="skills")
	skill = relationship("Skill", back_populates="user_skills")