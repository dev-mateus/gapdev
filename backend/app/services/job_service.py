"""Job service."""

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.job_repository import create_job as create_job_record
from app.repositories.job_repository import get_job_by_id, update_job_compatibility
from app.repositories.job_repository import list_jobs_by_user
from app.repositories.user_repo import get_user_by_email
from app.schemas.job import JobCreate, JobRead, JobWithSkillsRead


def _job_to_read(job: object) -> JobRead:
	"""Convert a SQLAlchemy job record into the public response schema."""

	level = getattr(job, "level", "Junior")
	# Handle enum or string
	level_str = level.value if hasattr(level, "value") else str(level)

	return JobRead(
		id=str(getattr(job, "id")),
		user_id=str(getattr(job, "user_id")),
		company_name=str(getattr(job, "company_name")),
		job_title=str(getattr(job, "job_title")),
		description=str(getattr(job, "description")),
		level=level_str,
		compatibility=int(getattr(job, "compatibility", 0)),
		created_at=getattr(job, "created_at"),
	)


def _job_to_read_with_skills(job: object) -> JobWithSkillsRead:
	"""Convert a SQLAlchemy job record with skills into the frontend response schema."""

	level = getattr(job, "level", "Junior")
	# Handle enum or string
	level_str = level.value if hasattr(level, "value") else str(level)

	# Extract skills names from the job's skills relationship
	skills = getattr(job, "skills", [])
	skill_names = [skill.skill_name for skill in skills] if skills else []

	return JobWithSkillsRead(
		id=str(getattr(job, "id")),
		user_id=str(getattr(job, "user_id")),
		company_name=str(getattr(job, "company_name")),
		job_title=str(getattr(job, "job_title")),
		description=str(getattr(job, "description")),
		level=level_str,
		compatibilidade=int(getattr(job, "compatibility", 0)),
		tecnologias=skill_names,
		created_at=getattr(job, "created_at"),
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


def create_job(db: Session, user_email: str, payload: JobCreate) -> JobRead:
	"""Create a job for the authenticated user."""

	user_id = _resolve_user_id(db, user_email)
	created_job = create_job_record(db, user_id, payload)
	return _job_to_read(created_job)


def list_jobs(db: Session, user_email: str) -> list[JobWithSkillsRead]:
	"""List jobs for the authenticated user."""

	user_id = _resolve_user_id(db, user_email)
	jobs = list_jobs_by_user(db, user_id)
	return [_job_to_read_with_skills(job) for job in jobs]


def set_job_compatibility(db: Session, user_email: str, job_id: str, compatibility: int) -> JobRead:
	"""Set compatibility for a job owned by the authenticated user."""

	user_id = _resolve_user_id(db, user_email)
	job = get_job_by_id(db, job_id)
	if not job or str(getattr(job, "user_id")) != user_id:
		raise HTTPException(
			status_code=status.HTTP_404_NOT_FOUND,
			detail="Vaga nao encontrada.",
		)

	updated_job = update_job_compatibility(db, job_id, compatibility)
	if not updated_job:
		raise HTTPException(
			status_code=status.HTTP_404_NOT_FOUND,
			detail="Vaga nao encontrada.",
		)

	return _job_to_read(updated_job)
