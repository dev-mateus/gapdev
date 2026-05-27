"""Analise routes for job descriptions."""

from fastapi import APIRouter, Depends, HTTPException, status
from pathlib import Path
import os
import json
import re
import unicodedata
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

try:
    from dotenv import load_dotenv
    from huggingface_hub import InferenceClient
    load_dotenv()
except Exception:
    # Lazy import: if deps missing, raise later on call
    InferenceClient = None  # type: ignore

router = APIRouter(prefix="/analise", tags=["analise"])


MODEL = "mistralai/Mistral-7B-Instruct-v0.2:featherless-ai"
PROMPT_PATH = Path(__file__).resolve().parents[4] / "ai_service" / "app" / "prompts" / "analise_prompt.txt"


SECTION_REQUIRED_MARKERS = (
    "requisitos",
    "requisito",
    "necessario",
    "necessária",
    "necessario",
    "requirements",
    "must have",
    "must-haves",
)

SECTION_OPTIONAL_MARKERS = (
    "diferenciais",
    "diferencial",
    "desejável",
    "desejaveis",
    "nice to have",
    "plus",
)

TEXT_REPLACEMENTS = (
    (r"c\s*#", "csharp"),
    (r"c\s*\+\+", "cpp"),
    (r"f\s*#", "fsharp"),
    (r"\.net", "dotnet"),
    (r"node\s*\.\s*js", "nodejs"),
    (r"react\s*\.\s*js", "reactjs"),
    (r"next\s*\.\s*js", "nextjs"),
    (r"vue\s*\.\s*js", "vuejs"),
    (r"ci\s*/\s*cd", "cicd"),
    (r"rest\s+api", "restapi"),
    (r"api\s+rest", "apirest"),
)


def _normalize_skill_name(name: str) -> str:
    return name.strip()


def _normalize_text_for_matching(text: str) -> str:
    """Normalize free text so skill aliases can be matched reliably."""

    normalized = text.lower()
    for pattern, replacement in TEXT_REPLACEMENTS:
        normalized = re.sub(pattern, replacement, normalized, flags=re.IGNORECASE)

    normalized = unicodedata.normalize("NFKD", normalized).encode("ascii", "ignore").decode("ascii")
    return re.sub(r"[^a-z0-9]+", " ", normalized).strip()


def _infer_default_required_level(description: str) -> str:
    """Infer a default required level from the vacancy seniority hints."""

    text = description.lower()
    if any(marker in text for marker in ("senior", "sênior", "sr", "arquitet")):
        return "advanced"
    if any(marker in text for marker in ("pleno", "intermedi", "mid")):
        return "intermediate"
    if any(marker in text for marker in ("junior", "júnior", "jr", "estagi")):
        return "basic"
    return "basic"


def _classify_section(line: str, current_section: str) -> str:
    """Track whether the current block is required or desirable."""

    lower = line.lower().strip()
    if not lower:
        return current_section

    if any(marker in lower for marker in SECTION_REQUIRED_MARKERS):
        return "required"

    if any(marker in lower for marker in SECTION_OPTIONAL_MARKERS):
        return "desirable"

    return current_section


def _build_skill_lookup(db: Session) -> list[tuple[dict, set[str]]]:
    """Load active catalog skills and precompute searchable keys."""

    lookup: list[tuple[dict, set[str]]] = []
    for skill in list_active_skills_with_aliases(db):
        keys = {_normalize_text_for_matching(skill.canonical_name)}
        for alias in getattr(skill, "aliases", []):
            keys.add(_normalize_text_for_matching(getattr(alias, "alias", "")))

        keys = {key for key in keys if key}
        if not keys:
            continue

        lookup.append((
            {
                "skill_id": str(skill.id),
                "skill_name": skill.canonical_name,
                "canonical_key": _normalize_text_for_matching(skill.canonical_name),
            },
            keys,
        ))

    return lookup


def _extract_catalog_skills(db: Session, description: str) -> list[dict]:
    """Deterministically extract only catalog skills present in the vacancy text."""

    default_level = _infer_default_required_level(description)
    lookup = _build_skill_lookup(db)

    lines = [line.strip() for line in description.splitlines()]
    matched: dict[str, dict] = {}
    current_section = "required"

    for raw_line in lines:
        if not raw_line:
            continue

        current_section = _classify_section(raw_line, current_section)
        normalized_line = _normalize_text_for_matching(raw_line)
        if not normalized_line:
            continue

        for skill_info, keys in lookup:
            if skill_info["skill_id"] in matched:
                continue

            if not any(
                (f" {key} " in f" {normalized_line} ")
                for key in keys
            ):
                continue

            matched[skill_info["skill_id"]] = {
                "skill_id": skill_info["skill_id"],
                "skill_name": skill_info["skill_name"],
                "raw_name": skill_info["skill_name"],
                "required_level": default_level if current_section == "required" else "basic",
                "priority": current_section,
                "evidence": raw_line,
            }

    return list(matched.values())[:12]


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


def _load_hf_token() -> str | None:
    token = os.environ.get("HF_TOKEN")
    if token:
        return token

    try:
        route_dir = Path(__file__).resolve()
        backend_env = route_dir.parents[3] / ".env"
        root_env = route_dir.parents[4] / "ai_service" / ".env"
        for env_file in (backend_env, root_env):
            if env_file.exists():
                load_dotenv(env_file, override=False)
                token = os.environ.get("HF_TOKEN")
                if token:
                    return token
    except Exception:
        return None

    return None


def _parse_model_response(text: str) -> dict:
    try:
        return json.loads(text)
    except Exception:
        start = text.find("{")
        if start != -1:
            decoder = json.JSONDecoder()
            candidate, _ = decoder.raw_decode(text[start:])
            return candidate
        raise


def _normalize_analysis(parsed: dict) -> dict:
    if not isinstance(parsed, dict):
        return parsed

    job_skills = parsed.get("job_skills")
    if not isinstance(job_skills, list):
        job_skills = parsed.get("skills")

    if isinstance(job_skills, list):
        normalized_job_skills = []
        for skill in job_skills:
            if isinstance(skill, dict):
                skill = dict(skill)
                raw_name = skill.get("raw_name") or skill.get("name")
                if isinstance(raw_name, str):
                    skill["raw_name"] = _normalize_skill_name(raw_name)
                if "priority" not in skill and "importance" in skill:
                    skill["priority"] = skill.get("importance")
                normalized_job_skills.append(skill)
            else:
                normalized_job_skills.append(skill)

        parsed = dict(parsed)
        parsed["job_skills"] = normalized_job_skills
        parsed["skills"] = [
            {
                "name": skill.get("raw_name", ""),
                "required_level": skill.get("required_level"),
                "importance": skill.get("priority"),
            }
            for skill in normalized_job_skills
            if isinstance(skill, dict)
        ]

    return parsed


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


def _load_prompt_template() -> str:
    return PROMPT_PATH.read_text(encoding="utf-8")


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

    if InferenceClient is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Dependencias de IA nao instaladas.")

    token = _load_hf_token()
    if not token:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="HF_TOKEN nao configurado no servidor.")

    client = InferenceClient(api_key=token)

    prompt = _load_prompt_template().replace("{description}", payload.description)

    detected_skills = _extract_catalog_skills(db, payload.description)
    catalog_preview = "\n".join(f"- {skill['skill_name']}" for skill in detected_skills) or "- Nenhuma skill detectada no catálogo"
    prompt = prompt.replace("{catalog_skills}", catalog_preview)

    try:
        completion = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=2048,
        )

        message = completion.choices[0].message
        text = message.content if getattr(message, "content", None) is not None else str(message)

        parsed = _normalize_analysis(_parse_model_response(text))
    except HTTPException:
        raise
    except Exception as exc:
        # Fallback: return the raw text in summary
        parsed = {"summary": str(exc), "job_skills": [], "skills": []}

    parsed = dict(parsed)
    parsed["job_skills"] = _merge_skills(detected_skills, list(parsed.get("job_skills") or parsed.get("skills") or []))
    parsed["skills"] = [
        {
            "skill_id": skill.get("skill_id"),
            "name": skill.get("skill_name", skill.get("raw_name", "")),
            "required_level": skill.get("required_level"),
            "importance": skill.get("priority"),
        }
        for skill in parsed["job_skills"]
    ]

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
