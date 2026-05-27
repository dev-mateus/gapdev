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
from app.repositories.job_skill_repository import (
	get_skill_by_id,
	resolve_catalog_skill,
	list_active_skills,
)
from app.repositories.user_repo import get_user_by_email
from app.schemas.user_skill import (
	SkillCatalogRead,
	UserSkillCreate,
	UserSkillRead,
	UserSkillUpdate,
)


def _skill_to_read(skill: object) -> UserSkillRead:
	"""Convert a SQLAlchemy skill record into the public response schema."""

	level = getattr(skill, "level", "Beginner")
	skill_relation = getattr(skill, "skill", None)
	
	# Handle enum or string
	level_str = level.value if hasattr(level, "value") else str(level)
	skill_id = getattr(skill, "skill_id", None)
	skill_name = getattr(skill_relation, "canonical_name", None) or getattr(skill, "skill_name", None) or ""

	return UserSkillRead(
		id=str(getattr(skill, "id")),
		user_id=str(getattr(skill, "user_id")),
		skill_id=str(skill_id) if skill_id is not None else "",
		skill_name=str(skill_name),
		level=level_str,
	)


def _catalog_skill_to_read(skill: object) -> SkillCatalogRead:
	"""Convert a SQLAlchemy catalog skill into the public payload."""

	return SkillCatalogRead(
		id=str(getattr(skill, "id")),
		name=str(getattr(skill, "canonical_name")),
		category=getattr(skill, "category", None),
		description=getattr(skill, "description", None),
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
	catalog_skill = resolve_catalog_skill(db, payload.skill_id, payload.skill_name)
	if not catalog_skill:
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Skill invalida.")

	created_skill = create_user_skill_record(db, user_id, str(catalog_skill.id), payload)
	return _skill_to_read(created_skill)


def list_catalog(db: Session, user_email: str) -> list[SkillCatalogRead]:
	"""List all active skills from the canonical catalog."""

	_resolve_user_id(db, user_email)
	skills = list_active_skills(db)
	return [_catalog_skill_to_read(skill) for skill in skills]


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
	skills = list_skills_by_job(db, user_id, job_id)

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
