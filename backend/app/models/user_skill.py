"""User skill model."""

from uuid import uuid4

from sqlalchemy import Column, ForeignKey, Integer, String

from app.db.base import Base


class UserSkill(Base):
    """Skills associated to a user."""

    __tablename__ = "user_skills"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    skill_name = Column(String(120), nullable=False)
    level = Column(Integer, nullable=False, default=1)