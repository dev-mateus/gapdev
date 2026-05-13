"""User Skill service."""

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.user_skill_repository import (
	create_user_skill as create_user_skill_record,
	delete_user_skill,
	get_user_skill_by_id,
	list_skills_by_job,
	list_skills_by_user,
	update_user_skill,
)
from app.repositories.user_repo import get_user_by_email
from app.schemas.user_skill import UserSkillCreate, UserSkillRead, UserSkillUpdate


def _skill_to_read(skill: object) -> UserSkillRead:
	"""Convert a SQLAlchemy skill record into the public response schema."""

	level = getattr(skill, "level", "Beginner")
	priority = getattr(skill, "priority", "desirable")
	
	# Handle enum or string
	level_str = level.value if hasattr(level, "value") else str(level)
	priority_str = priority.value if hasattr(priority, "value") else str(priority)

	return UserSkillRead(
		id=str(getattr(skill, "id")),
		user_id=str(getattr(skill, "user_id")),
		job_id=str(getattr(skill, "job_id")),
		skill_name=str(getattr(skill, "skill_name")),
		level=level_str,
		priority=priority_str,
	)


def _resolve_user_id(db: Session, user_email: str) -> str:
	"""Resolve the user id from the logged user's e-mail."""

	user = get_user_by_email(db, user_email)
	if not user:
		raise HTTPException(
			status_code=status.HTTP_404_NOT_FOUND,
			detail="Usuario nao encontrado.",
		)

	return str(user.id)


def create_skill(db: Session, user_email: str, payload: UserSkillCreate) -> UserSkillRead:
	"""Create a skill for the authenticated user."""

	user_id = _resolve_user_id(db, user_email)
	created_skill = create_user_skill_record(db, user_id, payload)
	return _skill_to_read(created_skill)


def get_skill(db: Session, user_email: str, skill_id: str) -> UserSkillRead:
	"""Get a skill for the authenticated user."""

	user_id = _resolve_user_id(db, user_email)
	skill = get_user_skill_by_id(db, skill_id)

	if not skill or str(skill.user_id) != user_id:
		raise HTTPException(
			status_code=status.HTTP_404_NOT_FOUND,
			detail="Skill nao encontrada.",
		)

	return _skill_to_read(skill)


def list_skills(db: Session, user_email: str) -> list[UserSkillRead]:
	"""List skills for the authenticated user."""

	user_id = _resolve_user_id(db, user_email)
	skills = list_skills_by_user(db, user_id)
	return [_skill_to_read(skill) for skill in skills]


def list_skills_for_job(db: Session, user_email: str, job_id: str) -> list[UserSkillRead]:
	"""List skills for a specific job."""

	user_id = _resolve_user_id(db, user_email)
	skills = list_skills_by_job(db, job_id)

	# Ensure user owns this job's skills
	for skill in skills:
		if str(skill.user_id) != user_id:
			raise HTTPException(
				status_code=status.HTTP_403_FORBIDDEN,
				detail="Acesso nao permitido.",
			)

	return [_skill_to_read(skill) for skill in skills]


def update_skill(db: Session, user_email: str, skill_id: str, payload: UserSkillUpdate) -> UserSkillRead:
	"""Update a skill for the authenticated user."""

	user_id = _resolve_user_id(db, user_email)
	skill = get_user_skill_by_id(db, skill_id)

	if not skill or str(skill.user_id) != user_id:
		raise HTTPException(
			status_code=status.HTTP_404_NOT_FOUND,
			detail="Skill nao encontrada.",
		)

	updated_skill = update_user_skill(db, skill_id, payload)
	return _skill_to_read(updated_skill)


def delete_skill(db: Session, user_email: str, skill_id: str) -> bool:
	"""Delete a skill for the authenticated user."""

	user_id = _resolve_user_id(db, user_email)
	skill = get_user_skill_by_id(db, skill_id)

	if not skill or str(skill.user_id) != user_id:
		raise HTTPException(
			status_code=status.HTTP_404_NOT_FOUND,
			detail="Skill nao encontrada.",
		)

	return delete_user_skill(db, skill_id)
