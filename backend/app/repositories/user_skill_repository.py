"""User Skill repository."""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user_skill import UserSkill, SkillLevel, SkillPriority
from app.schemas.user_skill import UserSkillCreate, UserSkillUpdate


def create_user_skill(db: Session, user_id: str, payload: UserSkillCreate) -> UserSkill:
	"""Persist a new user skill."""
	# Map string level to enum (default to Beginner)
	level_name = payload.level or "Beginner"
	try:
		level = SkillLevel[level_name]
	except KeyError:
		level = SkillLevel.Beginner

	# Map string priority to enum (default to desirable)
	priority_name = payload.priority or "desirable"
	try:
		priority = SkillPriority[priority_name]
	except KeyError:
		priority = SkillPriority.desirable

	# Try to find an existing skill for the same user/job/name to avoid duplicates
	statement = select(UserSkill).where(
		UserSkill.user_id == user_id,
		UserSkill.job_id == payload.job_id,
		UserSkill.skill_name == payload.skill_name,
	)
	existing = db.scalars(statement).first()

	if existing:
		# Promote level/priority if the new analysis suggests higher requirements
		LEVEL_ORDER = ["Beginner", "Basic", "Intermediate", "Advanced", "Specialist"]
		PRIORITY_ORDER = ["desirable", "required"]

		try:
			existing_level_idx = LEVEL_ORDER.index(existing.level.value if hasattr(existing.level, "value") else str(existing.level))
		except ValueError:
			existing_level_idx = 0

		try:
			new_level_idx = LEVEL_ORDER.index(level.value if hasattr(level, "value") else str(level))
		except ValueError:
			new_level_idx = 0

		# choose the higher level
		chosen_level = level if new_level_idx >= existing_level_idx else existing.level

		try:
			existing_priority_idx = PRIORITY_ORDER.index(existing.priority.value if hasattr(existing.priority, "value") else str(existing.priority))
		except ValueError:
			existing_priority_idx = 0

		try:
			new_priority_idx = PRIORITY_ORDER.index(priority.value if hasattr(priority, "value") else str(priority))
		except ValueError:
			new_priority_idx = 0

		chosen_priority = priority if new_priority_idx >= existing_priority_idx else existing.priority

		existing.level = chosen_level
		existing.priority = chosen_priority
		db.commit()
		db.refresh(existing)
		return existing

	# Create new record when not existing
	user_skill = UserSkill(
		user_id=user_id,
		job_id=payload.job_id,
		skill_name=payload.skill_name,
		level=level,
		priority=priority,
	)
	db.add(user_skill)
	db.commit()
	db.refresh(user_skill)
	return user_skill


def get_user_skill_by_id(db: Session, skill_id: str) -> UserSkill | None:
	"""Return a user skill by ID."""

	statement = select(UserSkill).where(UserSkill.id == skill_id)
	return db.scalars(statement).first()


def list_skills_by_user(db: Session, user_id: str) -> list[UserSkill]:
	"""Return all skills for a specific user."""

	statement = select(UserSkill).where(UserSkill.user_id == user_id)
	return list(db.scalars(statement).all())


def list_skills_by_job(db: Session, job_id: str) -> list[UserSkill]:
	"""Return all skills for a specific job."""

	statement = select(UserSkill).where(UserSkill.job_id == job_id)
	return list(db.scalars(statement).all())


def update_user_skill(db: Session, skill_id: str, payload: UserSkillUpdate) -> UserSkill | None:
	"""Update an existing user skill."""

	user_skill = get_user_skill_by_id(db, skill_id)
	if not user_skill:
		return None

	if payload.skill_name is not None:
		user_skill.skill_name = payload.skill_name
	if payload.level is not None:
		try:
			user_skill.level = SkillLevel[payload.level]
		except KeyError:
			user_skill.level = SkillLevel.Beginner
	if payload.priority is not None:
		try:
			user_skill.priority = SkillPriority[payload.priority]
		except KeyError:
			user_skill.priority = SkillPriority.desirable

	db.commit()
	db.refresh(user_skill)
	return user_skill


def delete_user_skill(db: Session, skill_id: str) -> bool:
	"""Delete a user skill."""

	user_skill = get_user_skill_by_id(db, skill_id)
	if not user_skill:
		return False

	db.delete(user_skill)
	db.commit()
	return True
