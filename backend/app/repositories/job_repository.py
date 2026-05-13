"""Job repository."""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.job import Job, JobLevel
from app.schemas.job import JobCreate, JobUpdate


def create_job(db: Session, user_id: str, payload: JobCreate) -> Job:
	"""Persist a new job for the given user."""

	# Map string level to enum
	level_value = payload.level.strip() if payload.level else "Junior"
	try:
		job_level = JobLevel[level_value]
	except KeyError:
		job_level = JobLevel.Junior

	job = Job(
		user_id=user_id,
		company_name=payload.company_name,
		job_title=payload.job_title,
		description=payload.description,
		level=job_level,
	)
	db.add(job)
	db.commit()
	db.refresh(job)
	return job


def get_job_by_id(db: Session, job_id: str) -> Job | None:
	"""Return a job by ID."""

	statement = select(Job).where(Job.id == job_id)
	return db.scalars(statement).first()


def list_jobs_by_user(db: Session, user_id: str) -> list[Job]:
	"""Return jobs for a specific user ordered by newest first."""

	statement = select(Job).where(Job.user_id == user_id).order_by(Job.created_at.desc())
	return list(db.scalars(statement).all())


def update_job(db: Session, job_id: str, payload: JobUpdate) -> Job | None:
	"""Update an existing job."""

	job = get_job_by_id(db, job_id)
	if not job:
		return None

	if payload.company_name is not None:
		job.company_name = payload.company_name
	if payload.job_title is not None:
		job.job_title = payload.job_title
	if payload.description is not None:
		job.description = payload.description
	if payload.level is not None:
		try:
			job.level = JobLevel[payload.level.strip()]
		except KeyError:
			job.level = JobLevel.Junior

	db.commit()
	db.refresh(job)
	return job


def delete_job(db: Session, job_id: str) -> bool:
	"""Delete a job."""

	job = get_job_by_id(db, job_id)
	if not job:
		return False

	db.delete(job)
	db.commit()
	return True
