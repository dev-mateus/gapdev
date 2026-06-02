"""Study plan models."""

from uuid import uuid4

from sqlalchemy import Column, DateTime, Enum as SQLEnum, ForeignKey, String, Text, UniqueConstraint, func
from sqlalchemy.orm import relationship

from app.db.base import Base
from app.models.enums import SkillLevel, SkillPriority, StudyPlanItemStatus, StudyPlanStatus


class StudyPlan(Base):
	"""Study plan generated for a user and job."""

	__tablename__ = "study_plans"
	__table_args__ = (
		UniqueConstraint("user_id", "job_id", name="study_plans_user_id_job_id_key"),
	)

	id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
	user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
	job_id = Column(String(36), ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False, index=True)
	status = Column(SQLEnum(StudyPlanStatus), nullable=False, default=StudyPlanStatus.draft)
	created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
	updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

	user = relationship("User", back_populates="study_plans")
	job = relationship("Job", back_populates="study_plans")
	items = relationship("StudyPlanItem", back_populates="study_plan", cascade="all, delete-orphan")


class StudyPlanItem(Base):
	"""Skill item inside a generated study plan."""

	__tablename__ = "study_plan_items"
	__table_args__ = (
		UniqueConstraint("study_plan_id", "skill_id", name="study_plan_items_study_plan_id_skill_id_key"),
	)

	id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
	study_plan_id = Column(String(36), ForeignKey("study_plans.id", ondelete="CASCADE"), nullable=False, index=True)
	skill_id = Column(String(36), ForeignKey("skills.id", ondelete="RESTRICT"), nullable=False, index=True)
	current_level = Column(SQLEnum(SkillLevel), nullable=True)
	target_level = Column(SQLEnum(SkillLevel), nullable=False)
	priority = Column(SQLEnum(SkillPriority), nullable=False, default=SkillPriority.desirable)
	reason = Column(Text, nullable=True)
	status = Column(SQLEnum(StudyPlanItemStatus), nullable=False, default=StudyPlanItemStatus.pending)
	created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
	updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

	study_plan = relationship("StudyPlan", back_populates="items")
	skill = relationship("Skill", back_populates="study_items")
