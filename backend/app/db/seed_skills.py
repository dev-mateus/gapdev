"""Seed data for the canonical skills catalog."""

from functools import lru_cache
import json
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.skill import Skill
from app.models.skill_alias import SkillAlias
from app.repositories.job_skill_repository import get_or_create_skill, get_skill_by_slug, normalize_skill_alias_key


CATALOG_PATH = Path(__file__).with_name("skills_catalog.json")
ALIASES_PATH = Path(__file__).with_name("skill_aliases.json")


@lru_cache(maxsize=1)
def load_default_skill_catalog() -> list[dict[str, object]]:
    """Load the canonical skill catalog from JSON."""

    return json.loads(CATALOG_PATH.read_text(encoding="utf-8"))


@lru_cache(maxsize=1)
def load_default_skill_aliases() -> list[dict[str, str]]:
    """Load the canonical skill aliases from JSON."""

    return json.loads(ALIASES_PATH.read_text(encoding="utf-8"))


DEFAULT_SKILL_CATALOG = load_default_skill_catalog()


def _ensure_skill(db: Session, item: dict[str, object]) -> tuple[Skill, bool]:
    """Create or update a canonical skill record from the seed catalog."""

    canonical_name = str(item["canonical_name"])
    slug = str(item.get("slug") or "").strip() or None
    skill = get_skill_by_slug(db, slug) if slug else None
    if not skill:
        skill = get_or_create_skill(db, canonical_name)

    should_commit = False
    if skill.canonical_name != canonical_name:
        skill.canonical_name = canonical_name
        should_commit = True

    if slug and skill.slug != slug:
        skill.slug = slug
        should_commit = True

    category = item.get("category")
    if isinstance(category, str) and skill.category != category:
        skill.category = category
        should_commit = True

    description = item.get("description")
    if isinstance(description, str) and skill.description != description:
        skill.description = description
        should_commit = True

    if not skill.active:
        skill.active = True
        should_commit = True

    if should_commit:
        db.commit()
        db.refresh(skill)

    return skill, should_commit


def _upsert_skill_alias(db: Session, skill: Skill, alias: str) -> bool:
    """Insert or update a normalized alias for a canonical skill."""

    normalized_alias = normalize_skill_alias_key(alias)
    if not normalized_alias:
        return False

    statement = select(SkillAlias).where(SkillAlias.normalized_alias == normalized_alias)
    existing_alias = db.scalars(statement).first()
    if existing_alias:
        if existing_alias.skill_id != skill.id or existing_alias.alias != alias:
            existing_alias.skill_id = skill.id
            existing_alias.alias = alias
            return True
        return False

    db.add(SkillAlias(skill_id=str(skill.id), alias=alias, normalized_alias=normalized_alias))
    return True


def seed_skills_catalog(db: Session) -> int:
    """Ensure the default skill catalog exists and is synchronized."""

    changed = 0
    seen_alias_keys: set[str] = set()

    for item in DEFAULT_SKILL_CATALOG:
        _, skill_changed = _ensure_skill(db, item)
        if skill_changed:
            changed += 1

    for alias_item in load_default_skill_aliases():
        skill_slug = alias_item["skill_slug"]
        alias = alias_item["alias"]
        normalized_alias = normalize_skill_alias_key(alias)
        if not normalized_alias or normalized_alias in seen_alias_keys:
            continue

        skill = get_skill_by_slug(db, skill_slug)
        if not skill:
            continue

        if _upsert_skill_alias(db, skill, alias):
            changed += 1
            seen_alias_keys.add(normalized_alias)

    if changed > 0:
        db.commit()

    return changed
