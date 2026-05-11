"""Analise routes for job descriptions."""

from fastapi import APIRouter, HTTPException, status
from pathlib import Path
import os
import json

from app.schemas.analise import AnaliseRequest, AnaliseResponse

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
def analisar_vaga_route(payload: AnaliseRequest) -> dict:
    """Analisa a descrição da vaga e retorna resumo estruturado de habilidades."""

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

    return parsed
