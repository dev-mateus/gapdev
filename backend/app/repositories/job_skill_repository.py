"""Job skill repository."""

from __future__ import annotations

import re
import unicodedata

from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload, selectinload

from app.models.job_skill import JobSkill
from app.models.enums import SkillLevel, SkillPriority
from app.models.skill import Skill
from app.schemas.job_skill import JobSkillCreate
from app.models.skill_alias import SkillAlias


def _normalize_skill_slug(raw_name: str) -> str:
	"""Generate a stable slug for a skill name."""

	name = raw_name.strip().lower()
	ascii_name = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode("ascii")
	normalized = re.sub(r"[^a-z0-9]+", "-", ascii_name).strip("-")
	return normalized or "skill"


def normalize_skill_alias_key(raw_name: str) -> str:
	"""Generate the alias key used by the canonical catalog."""

	name = raw_name.strip().lower()
	if not name:
		return ""

	overrides = {
		"c#": "csharp",
		"c sharp": "csharp",
		"c-sharp": "csharp",
		"c++": "cpp",
		"c plus plus": "cpp",
		"f#": "fsharp",
		"f sharp": "fsharp",
		".net": "dotnet",
		"dot net": "dotnet",
		"node.js": "nodejs",
		"react.js": "reactjs",
		"next.js": "nextjs",
		"vue.js": "vuejs",
		"ci/cd": "cicd",
		"rest api": "restapi",
		"api rest": "apirest",
	}
	if name in overrides:
		return overrides[name]

	ascii_name = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode("ascii")
	return re.sub(r"[^a-z0-9]+", "", ascii_name)
def get_skill_by_slug(db: Session, slug: str) -> Skill | None:
	"""Return a catalog skill by slug."""

	statement = select(Skill).where(Skill.slug == slug)
	return db.scalars(statement).first()


def get_skill_by_id(db: Session, skill_id: str) -> Skill | None:
	"""Return a catalog skill by ID."""

	statement = select(Skill).where(Skill.id == skill_id)
	return db.scalars(statement).first()


def get_skill_by_canonical_name(db: Session, canonical_name: str) -> Skill | None:
	"""Return a catalog skill by canonical name (case-insensitive)."""

	clean_name = canonical_name.strip()
	if not clean_name:
		return None

	statement = select(Skill).where(func.lower(Skill.canonical_name) == clean_name.lower())
	return db.scalars(statement).first()


def get_skill_by_normalized_alias(db: Session, normalized_alias: str) -> Skill | None:
	"""Return a catalog skill by normalized alias."""

	clean_alias = normalized_alias.strip()
	if not clean_alias:
		return None

	statement = (
		select(Skill)
		.join(SkillAlias, SkillAlias.skill_id == Skill.id)
		.where(SkillAlias.normalized_alias == clean_alias)
	)
	return db.scalars(statement).first()

def get_or_create_skill(db: Session, raw_name: str) -> Skill:
	"""Return a catalog skill for a raw analysis name."""

	clean_name = raw_name.strip() or "skill"
	slug = _normalize_skill_slug(clean_name)
	existing = get_skill_by_slug(db, slug)
	if existing:
		return existing

	existing_by_name = get_skill_by_canonical_name(db, clean_name)
	if existing_by_name:
		return existing_by_name

	skill = Skill(canonical_name=clean_name, slug=slug)
	db.add(skill)
	db.commit()
	db.refresh(skill)
	return skill


def resolve_catalog_skill(db: Session, skill_id: str | None = None, raw_name: str | None = None) -> Skill | None:
	"""Resolve a catalog skill without creating new records."""

	if skill_id:
		skill = get_skill_by_id(db, skill_id)
		if skill:
			return skill

	if not raw_name:
		return None

	clean_name = raw_name.strip()
	if not clean_name:
		return None

	skill = get_skill_by_canonical_name(db, clean_name)
	if skill:
		return skill

	skill = get_skill_by_slug(db, _normalize_skill_slug(clean_name))
	if skill:
		return skill

	return get_skill_by_normalized_alias(db, normalize_skill_alias_key(clean_name))

def list_active_skills(db: Session) -> list[Skill]:
	"""Return active catalog skills sorted by category and name."""

	statement = (
		select(Skill)
		.where(Skill.active.is_(True))
		.order_by(Skill.category.asc(), Skill.canonical_name.asc())
	)
	return list(db.scalars(statement).all())


def list_active_skills_with_aliases(db: Session) -> list[Skill]:
	"""Return active catalog skills with aliases preloaded."""

	statement = (
		select(Skill)
		.where(Skill.active.is_(True))
		.options(selectinload(Skill.aliases))
		.order_by(Skill.category.asc(), Skill.canonical_name.asc())
	)
	return list(db.scalars(statement).all())


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