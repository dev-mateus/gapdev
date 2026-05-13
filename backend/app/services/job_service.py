"""Job service."""

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.job_repository import create_job as create_job_record
from app.repositories.job_repository import list_jobs_by_user
from app.repositories.user_repo import get_user_by_email
from app.schemas.job import JobCreate, JobRead


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


def list_jobs(db: Session, user_email: str) -> list[JobRead]:
	"""List jobs for the authenticated user."""

	user_id = _resolve_user_id(db, user_email)
	jobs = list_jobs_by_user(db, user_id)
	return [_job_to_read(job) for job in jobs]
