"""Agent for study plan generation."""

from pathlib import Path
from typing import Any, Iterable
import json

from ai_service.app.tools.llm_client import ask_hf


PROMPT_PATH = Path(__file__).resolve().parents[1] / "prompts" / "plano_prompt.txt"

LEVEL_ORDER = ["Beginner", "Basic", "Intermediate", "Advanced", "Specialist"]
VALID_PRIORITIES = {"required", "desirable"}


def _load_prompt_template() -> str:
	return PROMPT_PATH.read_text(encoding="utf-8")


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


def _level_index(level: str | None) -> int:
	if not level:
		return -1

	try:
		return LEVEL_ORDER.index(level)
	except ValueError:
		return -1


def _normalize_level(level: Any, default: str | None = None) -> str | None:
	if level is None:
		return default

	value = str(level).strip()
	if value in LEVEL_ORDER:
		return value

	lower_value = value.lower()
	level_map = {
		"beginner": "Beginner",
		"basic": "Basic",
		"intermediate": "Intermediate",
		"advanced": "Advanced",
		"specialist": "Specialist",
	}
	return level_map.get(lower_value, default)


def _normalize_priority(priority: Any, default: str = "desirable") -> str:
	value = str(priority or default).strip().lower()
	return value if value in VALID_PRIORITIES else default


def _json_dumps(data: Any) -> str:
	return json.dumps(data, ensure_ascii=False, indent=2)


def _normalize_subskills(raw_subskills: Any, skill_name: str, target_level: str) -> list[dict]:
	"""Keep only well-formed learning topics for a module."""

	topics: list[dict] = []
	seen: set[str] = set()
	if isinstance(raw_subskills, list):
		for topic in raw_subskills:
			if isinstance(topic, dict):
				name = str(topic.get("name") or topic.get("skill_name") or "").strip()
				reason = str(topic.get("reason") or "").strip()
			else:
				name = str(topic or "").strip()
				reason = ""

			if not name:
				continue

			key = name.lower()
			if key in seen:
				continue

			if not reason:
				reason = f"Aprender {name} para dominar {skill_name}."

			topics.append({"name": name[:255], "reason": reason[:500]})
			seen.add(key)

	if not topics:
		topics = _fallback_subskills(skill_name, target_level)

	return topics[:5]


def _fallback_subskills(skill_name: str, target_level: str) -> list[dict]:
	"""Generic learning topics used when the model omits a module breakdown."""

	return [
		{
			"name": f"Fundamentos de {skill_name}",
			"reason": f"Dominar os conceitos basicos de {skill_name}.",
		},
		{
			"name": f"Pratica de {skill_name}",
			"reason": f"Praticar {skill_name} ate o nivel {target_level} com exercicios reais.",
		},
		{
			"name": f"Projeto com {skill_name}",
			"reason": f"Aplicar {skill_name} em um projeto para consolidar o aprendizado.",
		},
	]


def _fallback_items(job_skills: Iterable[dict], user_skills: Iterable[dict]) -> list[dict]:
	known_skill_ids = {
		str(skill.get("skill_id"))
		for skill in user_skills
		if isinstance(skill, dict) and skill.get("skill_id")
	}

	items: list[dict] = []
	for skill in job_skills:
		if not isinstance(skill, dict):
			continue

		skill_id = skill.get("skill_id")
		if not skill_id:
			continue

		# Only skills the user does not know belong in the plan.
		if str(skill_id) in known_skill_ids:
			continue

		target_level = _normalize_level(skill.get("required_level"), "Basic")
		current_level = None

		skill_name = skill.get("skill_name") or skill.get("raw_name") or "esta habilidade"
		items.append(
			{
				"skill_id": str(skill_id),
				"current_level": current_level,
				"target_level": target_level,
				"priority": _normalize_priority(skill.get("priority")),
				"reason": f"Desenvolver {skill_name} ate o nivel {target_level} para cobrir a lacuna desta vaga.",
				"subskills": _fallback_subskills(skill_name, target_level),
			}
		)

	return items[:8]


def _normalize_ai_items(parsed: dict, job_skills: list[dict], user_skills: list[dict]) -> list[dict]:
	if not isinstance(parsed, dict):
		return []

	raw_items = parsed.get("items")
	if not isinstance(raw_items, list):
		raw_items = parsed.get("study_plan_items")
	if not isinstance(raw_items, list):
		return []

	job_skill_by_id = {
		str(skill.get("skill_id")): skill
		for skill in job_skills
		if isinstance(skill, dict) and skill.get("skill_id")
	}
	known_skill_ids = {
		str(skill.get("skill_id"))
		for skill in user_skills
		if isinstance(skill, dict) and skill.get("skill_id")
	}

	normalized: list[dict] = []
	seen: set[str] = set()
	for item in raw_items:
		if not isinstance(item, dict):
			continue

		skill_id = item.get("skill_id")
		if not skill_id:
			continue

		skill_key = str(skill_id)
		job_skill = job_skill_by_id.get(skill_key)
		if not job_skill or skill_key in seen:
			continue

		# Only skills the user does not know belong in the plan.
		if skill_key in known_skill_ids:
			continue

		current_level = None
		target_level = _normalize_level(item.get("target_level"), _normalize_level(job_skill.get("required_level"), "Basic"))

		skill_name = job_skill.get("skill_name") or job_skill.get("raw_name") or "esta habilidade"
		reason = str(item.get("reason") or "").strip()
		if not reason:
			reason = f"Desenvolver {skill_name} ate o nivel {target_level} para atender melhor a vaga."

		normalized.append(
			{
				"skill_id": skill_key,
				"current_level": current_level,
				"target_level": target_level,
				"priority": _normalize_priority(item.get("priority"), _normalize_priority(job_skill.get("priority"))),
				"reason": reason[:500],
				"subskills": _normalize_subskills(item.get("subskills"), skill_name, target_level),
			}
		)
		seen.add(skill_key)

	return normalized[:8]


def generate_study_plan(
	job_context: dict,
	job_skills: list[dict],
	user_skills: list[dict],
) -> dict[str, Any]:
	"""Generate study plan items from a job analysis and the user's current skills."""

	prompt = _load_prompt_template()
	prompt = prompt.replace("{job_context}", _json_dumps(job_context))
	prompt = prompt.replace("{job_skills}", _json_dumps(job_skills))
	prompt = prompt.replace("{user_skills}", _json_dumps(user_skills))

	# Bail out when the backend has already filtered the gap to nothing.
	if not job_skills:
		return {"items": []}

	try:
		response = ask_hf(prompt, max_tokens=2400)
		parsed = _parse_model_response(response)
		items = _normalize_ai_items(parsed, job_skills, user_skills)
	except Exception:
		items = []

	if not items:
		items = _fallback_items(job_skills, user_skills)

	return {"items": items}
