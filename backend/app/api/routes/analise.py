"""Analise routes for job descriptions."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_database
from app.models.user import User
from app.schemas.analise import AnaliseRequest, AnaliseResponse
from app.schemas.job_skill import JobSkillCreate
from app.repositories.job_skill_repository import (
    list_active_skills_with_aliases,
    resolve_catalog_skill,
)
from app.services.job_skill_service import create_job_skill, list_job_skills_for_job
from ai_service.app.agents.analise_vaga import analyze_vaga

router = APIRouter(prefix="/analise", tags=["analise"])


def _map_skill_level(required_level: str | None) -> str:
    """Map AI required_level to database SkillLevel enum."""

    if not required_level:
        return "Beginner"

    level_map = {
        "basic": "Basic",
        "intermediate": "Intermediate",
        "advanced": "Advanced",
    }
    return level_map.get(required_level.lower(), "Beginner")


def _reverse_map_level(level) -> str:
    """Reverse map database SkillLevel back to required_level for response."""

    # Handle enum or string
    level_str = level.value if hasattr(level, "value") else str(level)

    reverse_map = {
        "Beginner": "basic",
        "Basic": "basic",
        "Intermediate": "intermediate",
        "Advanced": "advanced",
        "Specialist": "advanced",
    }
    return reverse_map.get(level_str, "basic")


def _map_skill_priority(importance: str | None) -> str:
    """Map AI importance to database SkillPriority enum."""

    if not importance:
        return "desirable"

    imp = importance.strip().lower()
    # Accept either low/medium/high or required/desirable from the model
    priority_map = {
        "low": "desirable",
        "medium": "desirable",
        "high": "required",
        "required": "required",
        "desirable": "desirable",
    }
    return priority_map.get(imp, "desirable")


def _reverse_map_importance(priority) -> str:
    """Reverse map database SkillPriority back to importance for response."""

    # Handle enum or string
    priority_str = priority.value if hasattr(priority, "value") else str(priority)
    if priority_str == "required":
        return "required"
    return "desirable"  # Default to desirable


def _merge_skills(detected: list[dict], ai_skills: list[dict]) -> list[dict]:
    """Prefer deterministic catalog matches while preserving any AI-only metadata."""

    merged: dict[str, dict] = {}
    for skill in ai_skills:
        skill_id = skill.get("skill_id") if isinstance(skill, dict) else None
        if not skill_id:
            continue
        merged[str(skill_id)] = dict(skill)

    for skill in detected:
        merged[str(skill["skill_id"])] = dict(skill)

    return list(merged.values())[:12]


def _normalize_job_skill_payload(db: Session, skill: dict) -> dict | None:
    """Resolve an AI skill payload to the canonical catalog representation."""

    raw_name = skill.get("raw_name") or skill.get("skill_name") or skill.get("name")
    raw_name_text = raw_name if isinstance(raw_name, str) else None
    resolved_skill = resolve_catalog_skill(db, skill.get("skill_id"), raw_name_text)
    if not resolved_skill:
        return None

    return {
        "skill_id": str(resolved_skill.id),
        "skill_name": resolved_skill.canonical_name,
        "raw_name": raw_name_text.strip() if raw_name_text and raw_name_text.strip() else resolved_skill.canonical_name,
        "required_level": _map_skill_level(skill.get("required_level")),
        "priority": _map_skill_priority(skill.get("priority", skill.get("importance"))),
    }


def _collect_catalog_skill_names(db: Session) -> list[str]:
    """Flatten active catalog skills and aliases into a unique list of labels."""

    names: list[str] = []
    for skill in list_active_skills_with_aliases(db):
        if getattr(skill, "canonical_name", None):
            names.append(str(skill.canonical_name))
        for alias in getattr(skill, "aliases", []):
            alias_name = getattr(alias, "alias", "")
            if alias_name:
                names.append(str(alias_name))

    return list(dict.fromkeys(name.strip() for name in names if name and name.strip()))


@router.post("", response_model=AnaliseResponse)
def analisar_vaga_route(
    payload: AnaliseRequest,
    db: Session = Depends(get_database),
    current_user: User = Depends(get_current_user),
) -> dict:
    """Analisa a descrição da vaga e retorna resumo estruturado de habilidades."""

    user_email = str(current_user.email)

    # Check if this job has already been analyzed (only if job_id provided)
    if payload.job_id:
        existing_skills = list_job_skills_for_job(db, user_email, payload.job_id)
        if existing_skills:
            # Return already analyzed skills
            return {
                "summary": "Análise já realizada anteriormente",
                "job_skills": [
                    {
                        "skill_id": skill.skill_id,
                        "skill_name": skill.skill.canonical_name,
                        "raw_name": skill.raw_name or skill.skill.canonical_name,
                        "required_level": _reverse_map_level(skill.required_level),
                        "priority": _reverse_map_importance(skill.priority),
                    }
                    for skill in existing_skills
                ],
                "skills": [
                    {
                        "skill_id": skill.skill_id,
                        "name": skill.skill.canonical_name,
                        "required_level": _reverse_map_level(skill.required_level),
                        "importance": _reverse_map_importance(skill.priority),
                    }
                    for skill in existing_skills
                ],
            }

    try:
        parsed = analyze_vaga(payload.description, catalog_skills=_collect_catalog_skill_names(db))
    except HTTPException:
        raise
    except Exception as exc:
        # Fallback: return the raw text in summary
        parsed = {"summary": str(exc), "job_skills": [], "skills": []}

    parsed = dict(parsed)

    # Save skills to database only if job_id is provided
    if payload.job_id and parsed.get("job_skills"):
        normalized_job_skills = []
        for skill in parsed["job_skills"]:
            try:
                if not isinstance(skill, dict):
                    continue

                normalized_skill = _normalize_job_skill_payload(db, skill)
                if not normalized_skill:
                    continue

                skill_create = JobSkillCreate(
                    job_id=payload.job_id,
                    skill_id=normalized_skill["skill_id"],
                    raw_name=normalized_skill["raw_name"],
                    required_level=normalized_skill["required_level"],
                    priority=normalized_skill["priority"],
                )
                create_job_skill(db, user_email, skill_create)
                normalized_job_skills.append(normalized_skill)
            except Exception as e:
                # Log error but continue saving other skills
                print(f"Error saving skill: {e}")

        if normalized_job_skills:
            parsed = dict(parsed)
            parsed["job_skills"] = normalized_job_skills
            parsed["skills"] = [
                {
                    "skill_id": skill["skill_id"],
                    "name": skill["skill_name"],
                    "required_level": skill["required_level"],
                    "importance": skill["priority"],
                }
                for skill in normalized_job_skills
            ]

    return parsed
