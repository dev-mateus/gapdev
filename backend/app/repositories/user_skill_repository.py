"""User Skill repository."""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user_skill import UserSkill, SkillLevel, SkillPriority
from app.schemas.user_skill import UserSkillCreate, UserSkillUpdate


def create_user_skill(db: Session, user_id: str, payload: UserSkillCreate) -> UserSkill:
	"""Persist a new user skill."""

	# Map string level to enum
	try:
		level = SkillLevel[payload.level]
	except KeyError:
		level = SkillLevel.Beginner

	# Map string priority to enum
	try:
		priority = SkillPriority[payload.priority]
	except KeyError:
		priority = SkillPriority.desirable

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
