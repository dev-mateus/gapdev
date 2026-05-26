"""Skill alias model."""

from uuid import uuid4

from sqlalchemy import Column, ForeignKey, String
from sqlalchemy.orm import relationship

from app.db.base import Base


class SkillAlias(Base):
	"""Normalized alias mapped to a canonical skill."""

	__tablename__ = "skill_aliases"

	id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
	skill_id = Column("skill_id", String(36), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
	alias = Column(String(255), nullable=False)
	normalized_alias = Column("normalized_alias", String(255), nullable=False, unique=True, index=True)
	skill = relationship("Skill", back_populates="aliases")