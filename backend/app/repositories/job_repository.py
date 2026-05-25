"""Job repository."""

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.job import Job, JobLevel
from app.models.job_skill import JobSkill
from app.schemas.job import JobCreate, JobUpdate


def create_job(db: Session, user_id: str, payload: JobCreate) -> Job:
	"""Persist a new job for the given user."""

	# payload.level já chega validado pelo Pydantic
	job_level = payload.level if payload.level is not None else JobLevel.Junior

	compatibility = max(0, min(100, int(payload.compatibility or 0)))

	job = Job(
		user_id=user_id,
		company_name=payload.company_name,
		job_title=payload.job_title,
		description=payload.description,
		level=job_level,
		compatibility=compatibility,
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
	"""Return jobs for a specific user ordered by newest first with skills eager loaded."""

	statement = (
		select(Job)
		.where(Job.user_id == user_id)
		.options(joinedload(Job.job_skills).joinedload(JobSkill.skill))
		.order_by(Job.created_at.desc())
	)

	return list(db.scalars(statement).unique().all())


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
		job.level = payload.level

	if payload.compatibility is not None:
		job.compatibility = max(0, min(100, int(payload.compatibility)))

	db.commit()
	db.refresh(job)
	return job


def update_job_compatibility(db: Session, job_id: str, compatibility: int) -> Job | None:
	"""Update only compatibility for an existing job."""

	job = get_job_by_id(db, job_id)
	if not job:
		return None

	job.compatibility = max(0, min(100, int(compatibility)))
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
