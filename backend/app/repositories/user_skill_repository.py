"""User Skill repository."""

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.job_skill import JobSkill
from app.models.user_skill import UserSkill
from app.models.enums import SkillLevel
from app.schemas.user_skill import UserSkillCreate, UserSkillUpdate

def create_user_skill(db: Session, user_id: str, skill_id: str, payload: UserSkillCreate) -> UserSkill:
	"""Persist a new user skill."""

	# Try to find an existing skill for the same user/catalog skill to avoid duplicates
	statement = select(UserSkill).where(
		UserSkill.user_id == user_id,
		UserSkill.skill_id == skill_id,
	)
	existing = db.scalars(statement).first()

	level_name = payload.level or "Beginner"
	try:
		level = SkillLevel[level_name]
	except KeyError:
		level = SkillLevel.Beginner

	if existing:
		# Promote level if the new payload suggests a higher competency.
		LEVEL_ORDER = ["Beginner", "Basic", "Intermediate", "Advanced", "Specialist"]

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

		existing.level = chosen_level
		db.commit()
		db.refresh(existing)
		return existing

	# Create new record
	user_skill = UserSkill(
		user_id=user_id,
		skill_id=skill_id,
		level=level,
	)
	db.add(user_skill)
	db.commit()
	db.refresh(user_skill)
	return user_skill


def get_user_skill_by_id(db: Session, skill_id: str) -> UserSkill | None:
	"""Return a user skill by ID."""

	statement = select(UserSkill).where(UserSkill.id == skill_id).options(joinedload(UserSkill.skill))
	return db.scalars(statement).first()


def get_user_skill_by_user_and_skill(db: Session, user_id: str, skill_id: str) -> UserSkill | None:
	"""Return a user skill for a specific user and catalog skill."""

	statement = select(UserSkill).where(UserSkill.user_id == user_id, UserSkill.skill_id == skill_id).options(joinedload(UserSkill.skill))
	return db.scalars(statement).first()


def list_skills_by_user(db: Session, user_id: str) -> list[UserSkill]:
	"""Return all skills for a specific user."""

	statement = select(UserSkill).where(UserSkill.user_id == user_id).options(joinedload(UserSkill.skill))
	return list(db.scalars(statement).all())


def list_skills_by_job(db: Session, user_id: str, job_id: str) -> list[UserSkill]:
	"""Return the user's skills that match the selected job by skill_id."""

	statement = (
		select(UserSkill)
		.join(JobSkill, JobSkill.skill_id == UserSkill.skill_id)
		.where(UserSkill.user_id == user_id, JobSkill.job_id == job_id)
		.options(joinedload(UserSkill.skill))
	)
	return list(db.scalars(statement).all())


def update_user_skill(db: Session, skill_id: str, payload: UserSkillUpdate) -> UserSkill | None:
	"""Update an existing user skill."""

	user_skill = get_user_skill_by_id(db, skill_id)
	if not user_skill:
		return None

	if payload.level is not None:
		try:
			user_skill.level = SkillLevel[payload.level]
		except KeyError:
			user_skill.level = SkillLevel.Beginner

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
