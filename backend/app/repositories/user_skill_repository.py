"""User Skill repository."""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user_skill import (
	UserSkill,
	SkillLevel,
	SkillPriority,
)
from app.schemas.user_skill import (
	UserSkillCreate,
	UserSkillUpdate,
)


LEVEL_ORDER = [
	"Beginner",
	"Basic",
	"Intermediate",
	"Advanced",
	"Specialist",
]

PRIORITY_ORDER = [
	"desirable",
	"required",
]


def _get_level_index(level: SkillLevel | str) -> int:
	"""Return the numeric order index for a skill level."""

	try:
		value = level.value if hasattr(level, "value") else str(level)
		return LEVEL_ORDER.index(value)
	except ValueError:
		return 0


def _get_priority_index(priority: SkillPriority | str) -> int:
	"""Return the numeric order index for a skill priority."""

	try:
		value = priority.value if hasattr(priority, "value") else str(priority)
		return PRIORITY_ORDER.index(value)
	except ValueError:
		return 0


def create_user_skill(
	db: Session,
	user_id: str,
	payload: UserSkillCreate,
) -> UserSkill:
	"""Persist a new user skill."""

	# payload já chega validado pelo Pydantic
	level = payload.level
	priority = payload.priority

	# Avoid duplicate skills for same user/job/name
	statement = select(UserSkill).where(
		UserSkill.user_id == user_id,
		UserSkill.job_id == payload.job_id,
		UserSkill.skill_name == payload.skill_name,
	)
	existing = db.scalars(statement).first()

	if existing:
		# Promote to higher level if needed
		existing_level_idx = _get_level_index(existing.level)
		new_level_idx = _get_level_index(level)

		chosen_level = (
			level
			if new_level_idx >= existing_level_idx
			else existing.level
		)

		# Promote priority if needed
		existing_priority_idx = _get_priority_index(existing.priority)
		new_priority_idx = _get_priority_index(priority)

		chosen_priority = (
			priority
			if new_priority_idx >= existing_priority_idx
			else existing.priority
		)

		existing.level = chosen_level
		existing.priority = chosen_priority
		db.commit()
		db.refresh(existing)
		return existing

	# Create new record
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


def get_user_skill_by_id(
	db: Session,
	skill_id: str,
) -> UserSkill | None:
	"""Return a user skill by ID."""

	statement = select(UserSkill).where(
		UserSkill.id == skill_id
	)

	return db.scalars(statement).first()


def list_skills_by_user(
	db: Session,
	user_id: str,
) -> list[UserSkill]:
	"""Return all skills for a specific user."""

	statement = select(UserSkill).where(
		UserSkill.user_id == user_id
	)

	return list(db.scalars(statement).all())


def list_skills_by_job(
	db: Session,
	job_id: str,
) -> list[UserSkill]:
	"""Return all skills for a specific job."""

	statement = select(UserSkill).where(
		UserSkill.job_id == job_id
	)

	return list(db.scalars(statement).all())


def update_user_skill(
	db: Session,
	skill_id: str,
	payload: UserSkillUpdate,
) -> UserSkill | None:
	"""Update an existing user skill."""

	user_skill = get_user_skill_by_id(db, skill_id)
	if not user_skill:
		return None

	if payload.skill_name is not None:
		user_skill.skill_name = payload.skill_name
	if payload.level is not None:
		user_skill.level = payload.level

	if payload.priority is not None:
		user_skill.priority = payload.priority

	db.commit()
	db.refresh(user_skill)
	return user_skill


def delete_user_skill(
	db: Session,
	skill_id: str,
) -> bool:
	"""Delete a user skill."""

	user_skill = get_user_skill_by_id(db, skill_id)
	if not user_skill:
		return False

	db.delete(user_skill)
	db.commit()
	return True