"""Study plan service."""

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from ai_service.app.agents.plano_estudo import generate_study_plan
from app.models.enums import SkillLevel
from app.repositories.job_repository import get_job_by_id
from app.repositories.job_skill_repository import list_job_skills_by_job
from app.repositories.study_plan_repository import (
	create_or_replace_study_plan,
	get_study_plan_by_user_and_job,
	get_study_plan_item_for_user,
	list_study_plans_by_user,
	update_study_plan_item_status,
)
from app.repositories.user_repo import get_user_by_email
from app.repositories.user_skill_repository import list_skills_by_user
from app.schemas.study_plan import StudyPlanItemRead, StudyPlanRead


LEVEL_ORDER = ["Beginner", "Basic", "Intermediate", "Advanced", "Specialist"]


def _enum_value(value: object | None) -> str | None:
	if value is None:
		return None
	return value.value if hasattr(value, "value") else str(value)


def _level_index(level: object | None) -> int:
	value = _enum_value(level)
	if value is None:
		return -1
	try:
		return LEVEL_ORDER.index(value)
	except ValueError:
		return -1


def _resolve_user_id(db: Session, user_email: str) -> str:
	"""Resolve the authenticated user's id."""

	user = get_user_by_email(db, user_email)
	if not user:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario nao encontrado.")
	return str(user.id)


def _resolve_job_for_user(db: Session, user_id: str, job_id: str):
	"""Return a job only when it belongs to the authenticated user."""

	job = get_job_by_id(db, job_id)
	if not job or str(job.user_id) != user_id:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vaga nao encontrada.")
	return job


def _item_to_read(item: object) -> StudyPlanItemRead:
	"""Convert a study plan item into the public response schema."""

	skill = getattr(item, "skill", None)
	return StudyPlanItemRead(
		id=str(getattr(item, "id")),
		study_plan_id=str(getattr(item, "study_plan_id")),
		skill_id=str(getattr(item, "skill_id")),
		skill_name=str(getattr(skill, "canonical_name", "")),
		current_level=_enum_value(getattr(item, "current_level", None)),
		target_level=str(_enum_value(getattr(item, "target_level", SkillLevel.Basic))),
		priority=str(_enum_value(getattr(item, "priority", "desirable"))),
		reason=getattr(item, "reason", None),
		status=str(_enum_value(getattr(item, "status", "pending"))),
		created_at=getattr(item, "created_at"),
		updated_at=getattr(item, "updated_at"),
	)


def _plan_to_read(plan: object) -> StudyPlanRead:
	"""Convert a study plan into the public response schema."""

	items = list(getattr(plan, "items", []) or [])
	items.sort(
		key=lambda item: (
			str(_enum_value(getattr(item, "priority", ""))) != "required",
			str(getattr(getattr(item, "skill", None), "canonical_name", "")),
		)
	)

	return StudyPlanRead(
		id=str(getattr(plan, "id")),
		user_id=str(getattr(plan, "user_id")),
		job_id=str(getattr(plan, "job_id")),
		status=str(_enum_value(getattr(plan, "status", "active"))),
		created_at=getattr(plan, "created_at"),
		updated_at=getattr(plan, "updated_at"),
		items=[_item_to_read(item) for item in items],
	)


def _job_skills_for_ai(job_skills: list[object]) -> list[dict]:
	"""Format analyzed job skills for the AI agent."""

	items: list[dict] = []
	for skill in job_skills:
		skill_relation = getattr(skill, "skill", None)
		items.append(
			{
				"skill_id": str(getattr(skill, "skill_id")),
				"skill_name": str(getattr(skill_relation, "canonical_name", getattr(skill, "raw_name", ""))),
				"raw_name": getattr(skill, "raw_name", None),
				"required_level": _enum_value(getattr(skill, "required_level", SkillLevel.Basic)),
				"priority": _enum_value(getattr(skill, "priority", "desirable")),
			}
		)
	return items


def _user_skills_for_ai(user_skills: list[object]) -> list[dict]:
	"""Format user skills for the AI agent."""

	items: list[dict] = []
	for skill in user_skills:
		skill_relation = getattr(skill, "skill", None)
		items.append(
			{
				"skill_id": str(getattr(skill, "skill_id")),
				"skill_name": str(getattr(skill_relation, "canonical_name", "")),
				"level": _enum_value(getattr(skill, "level", SkillLevel.Beginner)),
			}
		)
	return items


def _normalize_generated_items(generated_items: list[dict], job_skills: list[object], user_skills: list[object]) -> list[dict]:
	"""Keep generated items valid for the selected job and current user levels."""

	job_skill_by_id = {str(getattr(skill, "skill_id")): skill for skill in job_skills}
	user_skill_by_id = {str(getattr(skill, "skill_id")): skill for skill in user_skills}

	normalized: list[dict] = []
	seen: set[str] = set()
	for item in generated_items:
		if not isinstance(item, dict):
			continue

		skill_id = item.get("skill_id")
		if not skill_id:
			continue

		skill_key = str(skill_id)
		job_skill = job_skill_by_id.get(skill_key)
		if not job_skill or skill_key in seen:
			continue

		user_skill = user_skill_by_id.get(skill_key)
		current_level = item.get("current_level") or _enum_value(getattr(user_skill, "level", None))
		target_level = item.get("target_level") or _enum_value(getattr(job_skill, "required_level", SkillLevel.Basic))

		if _level_index(current_level) >= _level_index(target_level):
			continue

		normalized.append(
			{
				"skill_id": skill_key,
				"current_level": current_level,
				"target_level": target_level,
				"priority": item.get("priority") or _enum_value(getattr(job_skill, "priority", "desirable")),
				"reason": item.get("reason"),
				"status": "pending",
			}
		)
		seen.add(skill_key)

	return normalized


def generate_plan_for_job(db: Session, user_email: str, job_id: str, force_regenerate: bool = False) -> StudyPlanRead:
	"""Generate and persist a study plan for a job."""

	user_id = _resolve_user_id(db, user_email)
	job = _resolve_job_for_user(db, user_id, job_id)

	existing_plan = get_study_plan_by_user_and_job(db, user_id, job_id)
	if existing_plan and not force_regenerate:
		return _plan_to_read(existing_plan)

	job_skills = list_job_skills_by_job(db, job_id)
	if not job_skills:
		raise HTTPException(
			status_code=status.HTTP_400_BAD_REQUEST,
			detail="Analise a vaga antes de gerar o plano de estudos.",
		)

	user_skills = list_skills_by_user(db, user_id)
	ai_payload = generate_study_plan(
		job_context={
			"job_id": str(job.id),
			"title": str(job.job_title),
			"company": str(job.company_name),
			"level": _enum_value(getattr(job, "level", None)),
		},
		job_skills=_job_skills_for_ai(job_skills),
		user_skills=_user_skills_for_ai(user_skills),
	)

	generated_items = ai_payload.get("items", []) if isinstance(ai_payload, dict) else []
	items = _normalize_generated_items(generated_items, job_skills, user_skills)
	plan_status = "active" if items else "completed"
	plan = create_or_replace_study_plan(db, user_id, job_id, items, plan_status)
	return _plan_to_read(plan)


def list_plans(db: Session, user_email: str) -> list[StudyPlanRead]:
	"""List the authenticated user's study plans."""

	user_id = _resolve_user_id(db, user_email)
	return [_plan_to_read(plan) for plan in list_study_plans_by_user(db, user_id)]


def get_plan_for_job(db: Session, user_email: str, job_id: str) -> StudyPlanRead:
	"""Return a study plan for one job."""

	user_id = _resolve_user_id(db, user_email)
	_resolve_job_for_user(db, user_id, job_id)
	plan = get_study_plan_by_user_and_job(db, user_id, job_id)
	if not plan:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plano de estudos nao encontrado.")
	return _plan_to_read(plan)


def update_item_status(db: Session, user_email: str, item_id: str, item_status: str) -> StudyPlanItemRead:
	"""Update an item status for the authenticated user."""

	user_id = _resolve_user_id(db, user_email)
	item = get_study_plan_item_for_user(db, user_id, item_id)
	if not item:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item do plano nao encontrado.")

	updated = update_study_plan_item_status(db, item_id, item_status)
	if not updated:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item do plano nao encontrado.")

	updated = get_study_plan_item_for_user(db, user_id, item_id)
	return _item_to_read(updated)
