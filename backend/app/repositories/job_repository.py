"""Job repository."""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.job import Job
from app.schemas.job import JobCreate


def create_job(db: Session, user_id: str, payload: JobCreate) -> Job:
	"""Persist a new job for the given user."""

	job = Job(
		user_id=user_id,
		company_name=payload.company_name,
		job_title=payload.job_title,
		description=payload.description,
	)
	db.add(job)
	db.commit()
	db.refresh(job)
	return job


def list_jobs_by_user(db: Session, user_id: str) -> list[Job]:
	"""Return jobs for a specific user ordered by newest first."""

	statement = select(Job).where(Job.user_id == user_id).order_by(Job.created_at.desc())
	return list(db.scalars(statement).all())
