"""Job skill service."""

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.job_repository import get_job_by_id
from app.repositories.job_skill_repository import (
	create_or_update_job_skill,
	get_or_create_skill,
	get_skill_by_id,
	list_job_skills_by_job,
)
from app.repositories.user_repo import get_user_by_email
from app.schemas.job_skill import JobSkillCreate


def _resolve_user_id(db: Session, user_email: str) -> str:
	"""Resolve the authenticated user's id."""

	user = get_user_by_email(db, user_email)
	if not user:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario nao encontrado.")
	return str(user.id)


def _resolve_job_for_user(db: Session, user_email: str, job_id: str):
	"""Return a job only when it belongs to the authenticated user."""

	user_id = _resolve_user_id(db, user_email)
	job = get_job_by_id(db, job_id)
	if not job or str(job.user_id) != user_id:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vaga nao encontrada.")
	return job


def _resolve_catalog_skill(db: Session, skill_id: str | None = None, raw_name: str | None = None):
	"""Resolve a catalog skill from an id or a raw skill label."""

	if skill_id:
		skill = get_skill_by_id(db, skill_id)
		if skill:
			return skill

	if raw_name:
		return get_or_create_skill(db, raw_name)

	raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Skill invalida.")


def create_job_skill(db: Session, user_email: str, payload: JobSkillCreate):
	"""Create or update a skill analyzed for a job."""

	_resolve_job_for_user(db, user_email, payload.job_id)
	skill = _resolve_catalog_skill(db, payload.skill_id, payload.raw_name)
	return create_or_update_job_skill(db, payload, str(skill.id))


def list_job_skills_for_job(db: Session, user_email: str, job_id: str):
	"""List analyzed skills for a job owned by the authenticated user."""

	_resolve_job_for_user(db, user_email, job_id)
	return list_job_skills_by_job(db, job_id)