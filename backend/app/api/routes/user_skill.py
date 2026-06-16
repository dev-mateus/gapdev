"""User Skill routes."""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_database
from app.models.user import User
from app.schemas.user_skill import AcknowledgeNewSkillsRequest, SkillCatalogRead, UserSkillCreate, UserSkillRead, UserSkillUpdate
from app.services.user_skill_service import (
	acknowledge_new_skills,
	create_skill,
	delete_skill,
	get_skill,
	list_catalog,
	list_skills,
	list_skills_for_job,
	update_skill,
)

router = APIRouter(prefix="/skills", tags=["skills"])


@router.post("", response_model=UserSkillRead, status_code=status.HTTP_201_CREATED)
def create_skill_route(
	payload: UserSkillCreate,
	db: Session = Depends(get_database),
	current_user: User = Depends(get_current_user),
) -> UserSkillRead:
	"""Create a new skill for the current user."""

	return create_skill(db, str(current_user.email), payload)


@router.get("", response_model=list[UserSkillRead])
def list_skills_route(
	db: Session = Depends(get_database),
	current_user: User = Depends(get_current_user),
) -> list[UserSkillRead]:
	"""List all skills for the current user."""

	return list_skills(db, str(current_user.email))


@router.post("/acknowledge-new")
def acknowledge_new_skills_route(
	payload: AcknowledgeNewSkillsRequest,
	db: Session = Depends(get_database),
	current_user: User = Depends(get_current_user),
) -> dict[str, str]:
	"""Mark module skill badges as seen so they won't show 'nova' again."""

	return acknowledge_new_skills(db, str(current_user.email), payload.skill_ids)


@router.get("/catalog", response_model=list[SkillCatalogRead])
def list_catalog_route(
	db: Session = Depends(get_database),
	current_user: User = Depends(get_current_user),
) -> list[SkillCatalogRead]:
	"""List active catalog skills used by technology search."""

	return list_catalog(db, str(current_user.email))


@router.get("/{skill_id}", response_model=UserSkillRead)
def get_skill_route(
	skill_id: str,
	db: Session = Depends(get_database),
	current_user: User = Depends(get_current_user),
) -> UserSkillRead:
	"""Get a specific skill by ID."""

	return get_skill(db, str(current_user.email), skill_id)


@router.get("/job/{job_id}", response_model=list[UserSkillRead])
def list_skills_for_job_route(
	job_id: str,
	db: Session = Depends(get_database),
	current_user: User = Depends(get_current_user),
) -> list[UserSkillRead]:
	"""List all skills for a specific job."""

	return list_skills_for_job(db, str(current_user.email), job_id)


@router.patch("/{skill_id}", response_model=UserSkillRead)
def update_skill_route(
	skill_id: str,
	payload: UserSkillUpdate,
	db: Session = Depends(get_database),
	current_user: User = Depends(get_current_user),
) -> UserSkillRead:
	"""Update a skill for the current user."""

	return update_skill(db, str(current_user.email), skill_id, payload)


@router.delete("/{skill_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_skill_route(
	skill_id: str,
	db: Session = Depends(get_database),
	current_user: User = Depends(get_current_user),
) -> None:
	"""Delete a skill for the current user."""

	delete_skill(db, str(current_user.email), skill_id)
