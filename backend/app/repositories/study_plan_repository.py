"""Study plan repository."""

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload, selectinload

from app.models.enums import SkillLevel, SkillPriority, StudyPlanItemStatus, StudyPlanStatus
from app.models.study_plan import StudyPlan, StudyPlanItem


def _map_level(level_name: str | None) -> SkillLevel | None:
	"""Map an incoming level string to SkillLevel."""

	if level_name is None:
		return None

	value = str(level_name).strip()
	try:
		return SkillLevel[value]
	except KeyError:
		return SkillLevel.Basic


def _map_priority(priority_name: str | None) -> SkillPriority:
	"""Map an incoming priority string to SkillPriority."""

	value = str(priority_name or "desirable").strip()
	try:
		return SkillPriority[value]
	except KeyError:
		return SkillPriority.desirable


def _map_plan_status(status_name: str | None) -> StudyPlanStatus:
	"""Map an incoming plan status string to StudyPlanStatus."""

	value = str(status_name or "active").strip()
	try:
		return StudyPlanStatus[value]
	except KeyError:
		return StudyPlanStatus.active


def _map_item_status(status_name: str | None) -> StudyPlanItemStatus:
	"""Map an incoming item status string to StudyPlanItemStatus."""

	value = str(status_name or "pending").strip()
	try:
		return StudyPlanItemStatus[value]
	except KeyError:
		return StudyPlanItemStatus.pending


def _plan_load_options():
	return (
		selectinload(StudyPlan.items).joinedload(StudyPlanItem.skill),
		joinedload(StudyPlan.job),
	)


def get_study_plan_by_user_and_job(db: Session, user_id: str, job_id: str) -> StudyPlan | None:
	"""Return a user's study plan for a job."""

	statement = (
		select(StudyPlan)
		.where(StudyPlan.user_id == user_id, StudyPlan.job_id == job_id)
		.options(*_plan_load_options())
	)
	return db.scalars(statement).first()


def get_study_plan_by_id_for_user(db: Session, user_id: str, study_plan_id: str) -> StudyPlan | None:
	"""Return a study plan only when it belongs to a user."""

	statement = (
		select(StudyPlan)
		.where(StudyPlan.id == study_plan_id, StudyPlan.user_id == user_id)
		.options(*_plan_load_options())
	)
	return db.scalars(statement).first()


def list_study_plans_by_user(db: Session, user_id: str) -> list[StudyPlan]:
	"""Return all study plans for a user ordered by newest first."""

	statement = (
		select(StudyPlan)
		.where(StudyPlan.user_id == user_id)
		.options(*_plan_load_options())
		.order_by(StudyPlan.created_at.desc())
	)
	return list(db.scalars(statement).unique().all())


def create_or_replace_study_plan(
	db: Session,
	user_id: str,
	job_id: str,
	items: list[dict],
	status: str = "active",
) -> StudyPlan:
	"""Create a plan or replace the items of the existing user/job plan."""

	plan = get_study_plan_by_user_and_job(db, user_id, job_id)
	if plan:
		plan.items.clear()
		plan.status = _map_plan_status(status)
	else:
		plan = StudyPlan(
			user_id=user_id,
			job_id=job_id,
			status=_map_plan_status(status),
		)
		db.add(plan)

	db.flush()

	for item in items:
		study_item = StudyPlanItem(
			study_plan_id=plan.id,
			skill_id=str(item["skill_id"]),
			current_level=_map_level(item.get("current_level")),
			target_level=_map_level(item.get("target_level")) or SkillLevel.Basic,
			priority=_map_priority(item.get("priority")),
			reason=item.get("reason"),
			status=_map_item_status(item.get("status")),
		)
		plan.items.append(study_item)

	db.commit()
	return get_study_plan_by_user_and_job(db, user_id, job_id)


def get_study_plan_item_for_user(db: Session, user_id: str, item_id: str) -> StudyPlanItem | None:
	"""Return a study plan item only when it belongs to the user."""

	statement = (
		select(StudyPlanItem)
		.join(StudyPlan, StudyPlan.id == StudyPlanItem.study_plan_id)
		.where(StudyPlanItem.id == item_id, StudyPlan.user_id == user_id)
		.options(joinedload(StudyPlanItem.skill))
	)
	return db.scalars(statement).first()


def update_study_plan_item_status(db: Session, item_id: str, status: str) -> StudyPlanItem | None:
	"""Update the lifecycle status of a study plan item."""

	item = db.get(StudyPlanItem, item_id)
	if not item:
		return None

	item.status = _map_item_status(status)
	db.commit()
	db.refresh(item)
	return item
