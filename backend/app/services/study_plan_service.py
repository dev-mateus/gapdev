"""Study plan service."""

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from ai_service.app.agents.plano_estudo import generate_study_plan
from app.models.enums import SkillLevel, StudyPlanItemStatus
from app.repositories.job_repository import get_job_by_id
from app.repositories.job_skill_repository import list_job_skills_by_job, resolve_or_create_subtopic_skill
from app.repositories.study_plan_repository import (
	create_or_replace_study_plan,
	delete_study_plan,
	get_item_skill_for_user,
	get_study_plan_by_id_for_user,
	get_study_plan_by_user_and_job,
	get_study_plan_item_for_user,
	list_study_plans_by_user,
	list_user_items_for_skill,
	mark_item_completed,
	rename_study_plan,
	set_item_skill_status,
	update_study_plan_item_status,
)
from app.repositories.user_repo import get_user_by_email
from app.repositories.user_skill_repository import create_user_skill as create_user_skill_record, list_skills_by_user
from app.schemas.study_plan import StudyPlanItemRead, StudyPlanItemSkillRead, StudyPlanRead
from app.schemas.user_skill import UserSkillCreate


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


def _item_skill_to_read(subskill: object) -> StudyPlanItemSkillRead:
	"""Convert a module sub-skill into the public response schema."""

	skill = getattr(subskill, "skill", None)
	return StudyPlanItemSkillRead(
		id=str(getattr(subskill, "id")),
		study_plan_item_id=str(getattr(subskill, "study_plan_item_id")),
		skill_id=str(getattr(subskill, "skill_id")),
		skill_name=str(getattr(skill, "canonical_name", "")),
		reason=getattr(subskill, "reason", None),
		status=str(_enum_value(getattr(subskill, "status", "pending"))),
		created_at=getattr(subskill, "created_at"),
		updated_at=getattr(subskill, "updated_at"),
	)


def _item_to_read(item: object) -> StudyPlanItemRead:
	"""Convert a study plan item into the public response schema."""

	skill = getattr(item, "skill", None)
	subskills = sorted(
		list(getattr(item, "subskills", []) or []),
		key=lambda sub: str(getattr(sub, "created_at", "")),
	)
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
		subskills=[_item_skill_to_read(sub) for sub in subskills],
	)


def _default_plan_title(job: object) -> str:
	"""Build the default plan title shown to the user."""

	job_title = str(getattr(job, "job_title", "") or "").strip()
	company = str(getattr(job, "company_name", "") or "").strip()
	if job_title and company:
		return f"Plano para {job_title} - {company}"
	if job_title:
		return f"Plano para {job_title}"
	return "Plano de estudos"


def _plan_to_read(plan: object) -> StudyPlanRead:
	"""Convert a study plan into the public response schema."""

	items = list(getattr(plan, "items", []) or [])
	items.sort(
		key=lambda item: (
			str(_enum_value(getattr(item, "priority", ""))) != "required",
			str(getattr(getattr(item, "skill", None), "canonical_name", "")),
		)
	)

	job = getattr(plan, "job", None)
	title = str(getattr(plan, "title", "") or "").strip() or _default_plan_title(job)

	return StudyPlanRead(
		id=str(getattr(plan, "id")),
		user_id=str(getattr(plan, "user_id")),
		job_id=str(getattr(plan, "job_id")),
		title=title,
		job_title=str(getattr(job, "job_title", "") or "") or None,
		company_name=str(getattr(job, "company_name", "") or "") or None,
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


def _fallback_subskill_names(module_name: str) -> list[dict]:
	"""Generic learning topics used when the model omits a module breakdown."""

	return [
		{"name": f"Fundamentos de {module_name}", "reason": f"Dominar os conceitos basicos de {module_name}."},
		{"name": f"Conceitos intermediarios de {module_name}", "reason": f"Aprofundar o conhecimento em {module_name} alem do basico."},
		{"name": f"Pratica guiada de {module_name}", "reason": f"Aplicar {module_name} em exercicios praticos."},
		{"name": f"Boas praticas em {module_name}", "reason": f"Conhecer padroes e boas praticas adotados pelo mercado em {module_name}."},
		{"name": f"Projeto com {module_name}", "reason": f"Consolidar o aprendizado de {module_name} em um projeto."},
	]


def _resolve_subskills(db: Session, subskills: object, module_skill_id: str, module_name: str) -> list[dict]:
	"""Resolve generated learning topics into freshly created subtopic skills."""

	module_key = module_name.strip().lower()
	candidates: list[dict] = []
	seen_names: set[str] = {module_key} if module_key else set()
	for subskill in subskills or []:
		if isinstance(subskill, dict):
			name = str(subskill.get("name") or subskill.get("skill_name") or "").strip()
			reason = subskill.get("reason")
		else:
			name = str(subskill or "").strip()
			reason = None

		if not name:
			continue

		key = name.lower()
		if key in seen_names:
			continue
		seen_names.add(key)
		candidates.append({"name": name, "reason": reason})

	if not candidates:
		candidates = _fallback_subskill_names(module_name)

	resolved: list[dict] = []
	for candidate in candidates[:7]:
		catalog_skill = resolve_or_create_subtopic_skill(db, candidate["name"], module_name)
		if not catalog_skill:
			continue
		if str(catalog_skill.id) == module_skill_id:
			continue
		resolved.append(
			{
				"skill_id": str(catalog_skill.id),
				"reason": candidate.get("reason"),
				"status": "pending",
			}
		)

	return resolved


def _filter_missing_job_skills(job_skills: list[object], user_skills: list[object]) -> list[object]:
	"""Keep only job skills the user has NOT added to their profile.

	The study plan must contain exclusively the skills the user does not know
	yet (i.e. never selected). Any job skill already present in the user's
	profile, regardless of level, is ignored.
	"""

	known_skill_ids = {str(getattr(us, "skill_id")) for us in user_skills}

	missing: list[object] = []
	for job_skill in job_skills:
		skill_key = str(getattr(job_skill, "skill_id"))
		if skill_key in known_skill_ids:
			continue
		missing.append(job_skill)
	return missing


def _normalize_generated_items(db: Session, generated_items: list[dict], job_skills: list[object], user_skills: list[object]) -> list[dict]:
	"""Keep generated items valid for the selected job and current user levels."""

	job_skill_by_id = {str(getattr(skill, "skill_id")): skill for skill in job_skills}
	known_skill_ids = {str(getattr(us, "skill_id")) for us in user_skills}

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

		# Hard gate: only skills the user does NOT know belong in the plan.
		if skill_key in known_skill_ids:
			continue

		current_level = None
		target_level = item.get("target_level") or _enum_value(getattr(job_skill, "required_level", SkillLevel.Basic))

		module_name = (
			str(getattr(getattr(job_skill, "skill", None), "canonical_name", ""))
			or str(getattr(job_skill, "raw_name", ""))
			or "esta habilidade"
		)

		normalized.append(
			{
				"skill_id": skill_key,
				"current_level": current_level,
				"target_level": target_level,
				"priority": item.get("priority") or _enum_value(getattr(job_skill, "priority", "desirable")),
				"reason": item.get("reason"),
				"status": "pending",
				"subskills": _resolve_subskills(db, item.get("subskills"), skill_key, module_name),
			}
		)
		seen.add(skill_key)

	return normalized


def _items_from_missing_skills(db: Session, missing_job_skills: list[object]) -> list[dict]:
	"""Backstop plan built directly from the gap, when the AI returns nothing."""

	items: list[dict] = []
	for job_skill in missing_job_skills:
		skill_key = str(getattr(job_skill, "skill_id"))
		module_name = (
			str(getattr(getattr(job_skill, "skill", None), "canonical_name", ""))
			or str(getattr(job_skill, "raw_name", ""))
			or "esta habilidade"
		)
		target_level = _enum_value(getattr(job_skill, "required_level", SkillLevel.Basic))
		items.append(
			{
				"skill_id": skill_key,
				"current_level": None,
				"target_level": target_level,
				"priority": _enum_value(getattr(job_skill, "priority", "desirable")),
				"reason": f"Desenvolver {module_name} para atender o nivel {target_level} exigido pela vaga.",
				"status": "pending",
				"subskills": _resolve_subskills(db, None, skill_key, module_name),
			}
		)
	return items


def generate_plan_for_job(
	db: Session,
	user_email: str,
	job_id: str,
	force_regenerate: bool = False,
	title: str | None = None,
) -> StudyPlanRead:
	"""Generate and persist a study plan for a job."""

	user_id = _resolve_user_id(db, user_email)
	job = _resolve_job_for_user(db, user_id, job_id)

	plan_title = (title or "").strip() or _default_plan_title(job)

	existing_plan = get_study_plan_by_user_and_job(db, user_id, job_id)
	if existing_plan and not force_regenerate:
		# Backfill the title for legacy plans that were generated before
		# user-facing names existed.
		if not getattr(existing_plan, "title", None):
			rename_study_plan(db, existing_plan, plan_title)
		return _plan_to_read(existing_plan)

	job_skills = list_job_skills_by_job(db, job_id)
	if not job_skills:
		raise HTTPException(
			status_code=status.HTTP_400_BAD_REQUEST,
			detail="Analise a vaga antes de gerar o plano de estudos.",
		)

	user_skills = list_skills_by_user(db, user_id)

	# Only ask the AI about the actual gap so it can't waste tokens on
	# skills the user already meets at or above the required level.
	missing_job_skills = _filter_missing_job_skills(job_skills, user_skills)
	if not missing_job_skills:
		plan = create_or_replace_study_plan(db, user_id, job_id, [], "completed", title=plan_title)
		return _plan_to_read(plan)

	ai_payload = generate_study_plan(
		job_context={
			"job_id": str(job.id),
			"title": str(job.job_title),
			"company": str(job.company_name),
			"level": _enum_value(getattr(job, "level", None)),
		},
		job_skills=_job_skills_for_ai(missing_job_skills),
		user_skills=_user_skills_for_ai(user_skills),
	)

	generated_items = ai_payload.get("items", []) if isinstance(ai_payload, dict) else []
	items = _normalize_generated_items(db, generated_items, missing_job_skills, user_skills)

	# Backstop: if the model returned nothing usable, build the plan
	# directly from the gap so the user is never left without modules.
	if not items:
		items = _items_from_missing_skills(db, missing_job_skills)

	plan_status = "active" if items else "completed"
	plan = create_or_replace_study_plan(db, user_id, job_id, items, plan_status, title=plan_title)
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


def rename_plan(db: Session, user_email: str, plan_id: str, title: str) -> StudyPlanRead:
	"""Rename a study plan owned by the authenticated user."""

	clean_title = (title or "").strip()
	if not clean_title:
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Informe um nome para o plano.")
	if len(clean_title) > 200:
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="O nome do plano deve ter ate 200 caracteres.")

	user_id = _resolve_user_id(db, user_email)
	plan = get_study_plan_by_id_for_user(db, user_id, plan_id)
	if not plan:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plano de estudos nao encontrado.")

	rename_study_plan(db, plan, clean_title)
	refreshed = get_study_plan_by_id_for_user(db, user_id, plan_id)
	return _plan_to_read(refreshed)


def delete_plan(db: Session, user_email: str, plan_id: str) -> None:
	"""Delete a study plan owned by the authenticated user."""

	user_id = _resolve_user_id(db, user_email)
	plan = get_study_plan_by_id_for_user(db, user_id, plan_id)
	if not plan:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plano de estudos nao encontrado.")
	delete_study_plan(db, plan)


def _sync_skill_completion_across_plans(db: Session, user_id: str, completed_item: object) -> None:
	"""Mark the same skill as completed in every other plan of this user.

	Rationale: once the user finishes a module (the skill is added to the
	user's profile), seeing it as pending in another plan would be confusing.
	"""

	skill_id = str(getattr(completed_item, "skill_id", "") or "")
	if not skill_id:
		return

	siblings = list_user_items_for_skill(db, user_id, skill_id, exclude_item_id=str(completed_item.id))
	if not siblings:
		return

	for sibling in siblings:
		if sibling.status == StudyPlanItemStatus.completed:
			continue
		mark_item_completed(db, sibling)
	db.commit()


def update_item_status(db: Session, user_email: str, item_id: str, item_status: str) -> StudyPlanItemRead:
	"""Update an item status for the authenticated user."""

	user_id = _resolve_user_id(db, user_email)
	item = get_study_plan_item_for_user(db, user_id, item_id)
	if not item:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item do plano nao encontrado.")

	updated = update_study_plan_item_status(db, item_id, item_status)
	if not updated:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item do plano nao encontrado.")

	if getattr(updated, "status", None) == StudyPlanItemStatus.completed:
		_mark_module_skill_as_known(db, user_id, updated)
		_sync_skill_completion_across_plans(db, user_id, updated)

	updated = get_study_plan_item_for_user(db, user_id, item_id)
	return _item_to_read(updated)


def _mark_module_skill_as_known(db: Session, user_id: str, module: object) -> None:
	"""Persist the completed module skill into the user's known skills."""

	skill_id = str(getattr(module, "skill_id", "") or "")
	if not skill_id:
		return

	target_level = _enum_value(getattr(module, "target_level", None)) or SkillLevel.Basic.value
	create_user_skill_record(db, user_id, skill_id, UserSkillCreate(skill_id=skill_id, level=target_level))


def update_item_skill_status(db: Session, user_email: str, item_skill_id: str, item_status: str) -> StudyPlanItemSkillRead:
	"""Update a module sub-skill status for the authenticated user.

	When every sub-skill of the module is completed, the module skill is saved
	as a known user skill so future job analyses score a higher compatibility.
	"""

	user_id = _resolve_user_id(db, user_email)
	item_skill = get_item_skill_for_user(db, user_id, item_skill_id)
	if not item_skill:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item do plano nao encontrado.")

	updated = set_item_skill_status(db, item_skill, item_status)

	module = updated.study_plan_item
	if getattr(module, "status", None) == StudyPlanItemStatus.completed:
		_mark_module_skill_as_known(db, user_id, module)
		_sync_skill_completion_across_plans(db, user_id, module)

	refreshed = get_item_skill_for_user(db, user_id, item_skill_id)
	return _item_skill_to_read(refreshed)
