"""Study plan routes."""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_database
from app.models.user import User
from app.schemas.study_plan import (
	StudyPlanGenerateRequest,
	StudyPlanItemRead,
	StudyPlanItemSkillRead,
	StudyPlanItemStatusUpdate,
	StudyPlanRead,
)
from app.services.study_plan_service import (
	generate_plan_for_job,
	get_plan_for_job,
	list_plans,
	update_item_skill_status,
	update_item_status,
)

router = APIRouter(prefix="/study-plans", tags=["study-plans"])


@router.post("/generate", response_model=StudyPlanRead, status_code=status.HTTP_201_CREATED)
def generate_study_plan_route(
	payload: StudyPlanGenerateRequest,
	db: Session = Depends(get_database),
	current_user: User = Depends(get_current_user),
) -> StudyPlanRead:
	"""Generate and persist a study plan for a job."""

	return generate_plan_for_job(db, str(current_user.email), payload.job_id, payload.force_regenerate)


@router.get("", response_model=list[StudyPlanRead])
def list_study_plans_route(
	db: Session = Depends(get_database),
	current_user: User = Depends(get_current_user),
) -> list[StudyPlanRead]:
	"""List study plans for the current user."""

	return list_plans(db, str(current_user.email))


@router.get("/job/{job_id}", response_model=StudyPlanRead)
def get_study_plan_for_job_route(
	job_id: str,
	db: Session = Depends(get_database),
	current_user: User = Depends(get_current_user),
) -> StudyPlanRead:
	"""Return a study plan generated for a job."""

	return get_plan_for_job(db, str(current_user.email), job_id)


@router.patch("/items/{item_id}/status", response_model=StudyPlanItemRead)
def update_study_plan_item_status_route(
	item_id: str,
	payload: StudyPlanItemStatusUpdate,
	db: Session = Depends(get_database),
	current_user: User = Depends(get_current_user),
) -> StudyPlanItemRead:
	"""Update the status of one study plan item."""

	return update_item_status(db, str(current_user.email), item_id, payload.status)


@router.patch("/item-skills/{item_skill_id}/status", response_model=StudyPlanItemSkillRead)
def update_study_plan_item_skill_status_route(
	item_skill_id: str,
	payload: StudyPlanItemStatusUpdate,
	db: Session = Depends(get_database),
	current_user: User = Depends(get_current_user),
) -> StudyPlanItemSkillRead:
	"""Update the status of one module sub-skill (learning topic)."""

	return update_item_skill_status(db, str(current_user.email), item_skill_id, payload.status)
