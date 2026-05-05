"""Job routes."""

from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_database
from app.schemas.job import JobCreate, JobRead
from app.services.job_service import create_job, list_jobs

router = APIRouter(prefix="/jobs", tags=["jobs"])


def _get_user_email(x_user_email: str | None = Header(default=None, alias="X-User-Email")) -> str:
	"""Return the logged user's e-mail from the request headers."""

	if not x_user_email:
		raise HTTPException(
			status_code=status.HTTP_401_UNAUTHORIZED,
			detail="Usuario nao autenticado.",
		)

	return x_user_email.strip()


@router.post("", response_model=JobRead, status_code=status.HTTP_201_CREATED)
def create_job_route(
	payload: JobCreate,
	db: Session = Depends(get_database),
	user_email: str = Depends(_get_user_email),
) -> JobRead:
	"""Create a new job for the current user."""

	return create_job(db, user_email, payload)


@router.get("", response_model=list[JobRead])
def list_jobs_route(
	db: Session = Depends(get_database),
	user_email: str = Depends(_get_user_email),
) -> list[JobRead]:
	"""List the current user's jobs."""

	return list_jobs(db, user_email)
