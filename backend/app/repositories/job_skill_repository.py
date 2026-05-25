"""Job skill repository."""

from __future__ import annotations

import re

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.job_skill import JobSkill
from app.models.skill import Skill
from app.models.enums import SkillLevel, SkillPriority
from app.schemas.job_skill import JobSkillCreate


def _normalize_skill_slug(raw_name: str) -> str:
	"""Generate a stable slug for a skill name."""

	normalized = re.sub(r"[^a-z0-9]+", "", raw_name.strip().lower())
	if normalized:
		return normalized

	fallback = re.sub(r"\s+", "-", raw_name.strip().lower())
	return fallback or "skill"


def get_skill_by_slug(db: Session, slug: str) -> Skill | None:
	"""Return a catalog skill by slug."""

	statement = select(Skill).where(Skill.slug == slug)
	return db.scalars(statement).first()


def get_skill_by_id(db: Session, skill_id: str) -> Skill | None:
	"""Return a catalog skill by ID."""

	statement = select(Skill).where(Skill.id == skill_id)
	return db.scalars(statement).first()


def get_or_create_skill(db: Session, raw_name: str) -> Skill:
	"""Return a catalog skill for a raw analysis name."""

	slug = _normalize_skill_slug(raw_name)
	existing = get_skill_by_slug(db, slug)
	if existing:
		return existing

	skill = Skill(canonical_name=raw_name.strip() or slug, slug=slug)
	db.add(skill)
	db.commit()
	db.refresh(skill)
	return skill


def _map_level(level_name: str | None) -> SkillLevel:
	"""Map an incoming level string to the enum used by the database."""

	value = (level_name or "Basic").strip()
	try:
		return SkillLevel[value]
	except KeyError:
		return SkillLevel.Basic


def _map_priority(priority_name: str | None) -> SkillPriority:
	"""Map an incoming priority string to the enum used by the database."""

	value = (priority_name or "desirable").strip()
	try:
		return SkillPriority[value]
	except KeyError:
		return SkillPriority.desirable


def get_job_skill_by_job_and_skill(db: Session, job_id: str, skill_id: str) -> JobSkill | None:
	"""Return an existing job skill for a job and catalog skill."""

	statement = select(JobSkill).where(JobSkill.job_id == job_id, JobSkill.skill_id == skill_id)
	return db.scalars(statement).first()


def create_or_update_job_skill(db: Session, payload: JobSkillCreate, skill_id: str) -> JobSkill:
	"""Insert or update a job skill record."""

	required_level = _map_level(payload.required_level)
	priority = _map_priority(payload.priority)

	existing = get_job_skill_by_job_and_skill(db, payload.job_id, skill_id)
	if existing:
		existing.raw_name = payload.raw_name
		existing.required_level = required_level
		existing.priority = priority
		db.commit()
		db.refresh(existing)
		return existing

	job_skill = JobSkill(
		job_id=payload.job_id,
		skill_id=skill_id,
		raw_name=payload.raw_name,
		required_level=required_level,
		priority=priority,
	)
	db.add(job_skill)
	db.commit()
	db.refresh(job_skill)
	return job_skill


def list_job_skills_by_job(db: Session, job_id: str) -> list[JobSkill]:
	"""Return all analyzed skills for a job."""

	statement = (
		select(JobSkill)
		.where(JobSkill.job_id == job_id)
		.options(joinedload(JobSkill.skill))
		.order_by(JobSkill.created_at.asc())
	)
	return list(db.scalars(statement).all())