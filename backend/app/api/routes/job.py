"""Job routes."""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_database
from app.models.user import User
from app.schemas.job import JobCompatibilityUpdate, JobCreate, JobRead, JobWithSkillsRead
from app.services.job_service import create_job, delete_job, list_jobs, set_job_compatibility

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.post("", response_model=JobRead, status_code=status.HTTP_201_CREATED)
def create_job_route(
	payload: JobCreate,
	db: Session = Depends(get_database),
	current_user: User = Depends(get_current_user),
) -> JobRead:
	"""Create a new job for the current user."""

	return create_job(db, str(current_user.email), payload)


@router.get("", response_model=list[JobWithSkillsRead])
def list_jobs_route(
	db: Session = Depends(get_database),
	current_user: User = Depends(get_current_user),
) -> list[JobWithSkillsRead]:
	"""List the current user's jobs."""

	return list_jobs(db, str(current_user.email))


@router.patch("/{job_id}/compatibility", response_model=JobRead)
def update_job_compatibility_route(
	job_id: str,
	payload: JobCompatibilityUpdate,
	db: Session = Depends(get_database),
	current_user: User = Depends(get_current_user),
) -> JobRead:
	"""Update compatibility for a specific job."""

	return set_job_compatibility(db, str(current_user.email), job_id, payload.compatibility)


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job_route(
	job_id: str,
	db: Session = Depends(get_database),
	current_user: User = Depends(get_current_user),
) -> None:
	"""Delete a specific job for the authenticated user."""

	delete_job(db, str(current_user.email), job_id)
	return None
