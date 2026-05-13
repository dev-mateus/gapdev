"""Analise routes for job descriptions."""

from fastapi import APIRouter, Depends, Header, HTTPException, status
from pathlib import Path
import os
import json
from sqlalchemy.orm import Session

from app.api.deps import get_database
from app.schemas.analise import AnaliseRequest, AnaliseResponse
from app.services.user_skill_service import create_skill
from app.repositories.user_skill_repository import list_skills_by_job
from app.schemas.user_skill import UserSkillCreate

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


def _get_user_email(x_user_email: str | None = Header(default=None, alias="X-User-Email")) -> str:
	"""Return the logged user's e-mail from the request headers."""

	if not x_user_email:
		raise HTTPException(
			status_code=status.HTTP_401_UNAUTHORIZED,
			detail="Usuario nao autenticado.",
		)

	return x_user_email.strip()


def _normalize_skill_name(name: str) -> str:
    lookup = {
        "javascript": "JavaScript/TypeScript",
        "typescript": "JavaScript/TypeScript",
        "javascript, typescript": "JavaScript/TypeScript",
        "react": "React",
        "html, css": "HTML/CSS",
        "apis (rest)": "APIs REST",
        "rest apis": "APIs REST",
        "git, github": "Git/GitHub",
        "responsive ui and ux practices": "UI responsiva",
    }
    return lookup.get(name.strip().lower(), name.strip())


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

	priority_map = {
		"low": "desirable",
		"medium": "desirable",
		"high": "required",
	}
	return priority_map.get(importance.lower(), "desirable")


def _reverse_map_importance(priority) -> str:
	"""Reverse map database SkillPriority back to importance for response."""

	# Handle enum or string
	priority_str = priority.value if hasattr(priority, "value") else str(priority)
	
	if priority_str == "required":
		return "high"
	return "medium"  # Default to medium for desirable


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

    skills = parsed.get("skills")
    if isinstance(skills, list):
        normalized_skills = []
        for skill in skills:
            if isinstance(skill, dict) and isinstance(skill.get("name"), str):
                skill = dict(skill)
                skill["name"] = _normalize_skill_name(skill["name"])
                normalized_skills.append(skill)
            else:
                normalized_skills.append(skill)
        parsed = dict(parsed)
        parsed["skills"] = normalized_skills

    return parsed


def _load_prompt_template() -> str:
    return PROMPT_PATH.read_text(encoding="utf-8")


@router.post("", response_model=AnaliseResponse)
def analisar_vaga_route(
	payload: AnaliseRequest,
	db: Session = Depends(get_database),
	user_email: str = Depends(_get_user_email),
) -> dict:
    """Analisa a descrição da vaga e retorna resumo estruturado de habilidades."""

    # Check if this job has already been analyzed (only if job_id provided)
    if payload.job_id:
        existing_skills = list_skills_by_job(db, payload.job_id)
        if existing_skills:
            # Return already analyzed skills
            return {
                "summary": "Análise já realizada anteriormente",
                "skills": [
                    {
                        "name": skill.skill_name,
                        "required_level": _reverse_map_level(skill.level),
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

    try:
        completion = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=512,
        )

        message = completion.choices[0].message
        text = message.content if getattr(message, "content", None) is not None else str(message)

        parsed = _normalize_analysis(_parse_model_response(text))
    except HTTPException:
        raise
    except Exception as exc:
        # Fallback: return the raw text in summary
        parsed = {"summary": str(exc), "skills": []}

    # Save skills to database only if job_id is provided
    if payload.job_id and parsed.get("skills"):
        for skill in parsed["skills"]:
            try:
                skill_create = UserSkillCreate(
                    job_id=payload.job_id,
                    skill_name=skill.get("name", ""),
                    level=_map_skill_level(skill.get("required_level")),
                    priority=_map_skill_priority(skill.get("importance")),
                )
                create_skill(db, user_email, skill_create)
            except Exception as e:
                # Log error but continue saving other skills
                print(f"Error saving skill: {e}")

    return parsed
