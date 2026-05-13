"""User Skill routes."""

from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_database
from app.schemas.user_skill import UserSkillCreate, UserSkillRead, UserSkillUpdate
from app.services.user_skill_service import (
	create_skill,
	delete_skill,
	get_skill,
	list_skills,
	list_skills_for_job,
	update_skill,
)

router = APIRouter(prefix="/skills", tags=["skills"])


def _get_user_email(x_user_email: str | None = Header(default=None, alias="X-User-Email")) -> str:
	"""Return the logged user's e-mail from the request headers."""

	if not x_user_email:
		raise HTTPException(
			status_code=status.HTTP_401_UNAUTHORIZED,
			detail="Usuario nao autenticado.",
		)

	return x_user_email.strip()


@router.post("", response_model=UserSkillRead, status_code=status.HTTP_201_CREATED)
def create_skill_route(
	payload: UserSkillCreate,
	db: Session = Depends(get_database),
	user_email: str = Depends(_get_user_email),
) -> UserSkillRead:
	"""Create a new skill for the current user."""

	return create_skill(db, user_email, payload)


@router.get("", response_model=list[UserSkillRead])
def list_skills_route(
	db: Session = Depends(get_database),
	user_email: str = Depends(_get_user_email),
) -> list[UserSkillRead]:
	"""List all skills for the current user."""

	return list_skills(db, user_email)


@router.get("/{skill_id}", response_model=UserSkillRead)
def get_skill_route(
	skill_id: str,
	db: Session = Depends(get_database),
	user_email: str = Depends(_get_user_email),
) -> UserSkillRead:
	"""Get a specific skill by ID."""

	return get_skill(db, user_email, skill_id)


@router.get("/job/{job_id}", response_model=list[UserSkillRead])
def list_skills_for_job_route(
	job_id: str,
	db: Session = Depends(get_database),
	user_email: str = Depends(_get_user_email),
) -> list[UserSkillRead]:
	"""List all skills for a specific job."""

	return list_skills_for_job(db, user_email, job_id)


@router.patch("/{skill_id}", response_model=UserSkillRead)
def update_skill_route(
	skill_id: str,
	payload: UserSkillUpdate,
	db: Session = Depends(get_database),
	user_email: str = Depends(_get_user_email),
) -> UserSkillRead:
	"""Update a skill for the current user."""

	return update_skill(db, user_email, skill_id, payload)


@router.delete("/{skill_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_skill_route(
	skill_id: str,
	db: Session = Depends(get_database),
	user_email: str = Depends(_get_user_email),
) -> None:
	"""Delete a skill for the current user."""

	delete_skill(db, user_email, skill_id)
