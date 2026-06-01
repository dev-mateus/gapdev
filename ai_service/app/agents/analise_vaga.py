"""Agent for vaga analysis."""

from pathlib import Path
from typing import Any, Dict, Iterable
import json
import re
import unicodedata

from ai_service.app.schemas.resposta import VagaAnalysis
from ai_service.app.tools.llm_client import ask_hf

PROMPT_PATH = Path(__file__).resolve().parents[1] / "prompts" / "analise_prompt.txt"


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


def _collapse_spaces(text: str) -> str:
	return re.sub(r"\s+", " ", text).strip()


def _strip_version_suffixes(text: str) -> str:
	"""Remove numeric suffixes attached to tokens, e.g. html5 -> html."""

	without_suffix = re.sub(r"(?<=[a-z])\d+\b", "", text)
	return _collapse_spaces(without_suffix)


def _build_matching_keys(text: str) -> set[str]:
	"""Create matching variants to reduce the need for manual aliases."""

	base = _normalize_text_for_matching(text)
	if not base:
		return set()

	keys = {base, base.replace(" ", "")}
	no_version = _strip_version_suffixes(base)
	if no_version:
		keys.add(no_version)
		keys.add(no_version.replace(" ", ""))

	return {key for key in keys if key}


def _load_prompt_template() -> str:
	return PROMPT_PATH.read_text(encoding="utf-8")


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


def _normalize_catalog_skills(catalog_skills: Iterable[str] | None) -> str:
	items = [skill.strip() for skill in catalog_skills or [] if isinstance(skill, str) and skill.strip()]
	return "\n".join(f"- {skill}" for skill in items) if items else "- Nenhuma skill detectada no catálogo"


def _build_skill_lookup(catalog_skills: Iterable[str] | None) -> list[tuple[dict, set[str]]]:
	lookup: list[tuple[dict, set[str]]] = []
	for skill_name in catalog_skills or []:
		if not isinstance(skill_name, str):
			continue
		normalized_name = _normalize_skill_name(skill_name)
		keys = _build_matching_keys(normalized_name)
		if not keys:
			continue
		canonical_key = _normalize_text_for_matching(normalized_name)
		if not canonical_key:
			continue
		lookup.append((
			{
				"skill_id": canonical_key,
				"skill_name": normalized_name,
				"canonical_key": canonical_key,
			},
			keys,
		))

	return lookup


def _extract_catalog_skills(catalog_skills: Iterable[str] | None, description: str) -> list[dict]:
	"""Deterministically extract only catalog skills present in the vacancy text."""

	default_level = _infer_default_required_level(description)
	lookup = _build_skill_lookup(catalog_skills)

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
		line_no_version = _strip_version_suffixes(normalized_line)
		line_text = f" {normalized_line} "
		line_text_no_version = f" {line_no_version} "

		for skill_info, keys in lookup:
			if skill_info["skill_id"] in matched:
				continue

			if not any(
				(f" {key} " in line_text)
				or (f" {key} " in line_text_no_version)
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
	"""Keep only detected catalog matches and enrich them with AI metadata."""

	merged: dict[str, dict] = {
		str(skill["skill_id"]): dict(skill)
		for skill in detected
		if isinstance(skill, dict) and skill.get("skill_id")
	}

	for skill in ai_skills:
		if not isinstance(skill, dict):
			continue
		skill_id = skill.get("skill_id")
		if not skill_id:
			continue

		merged_skill = merged.get(str(skill_id))
		if not merged_skill:
			continue

		for field in ("raw_name", "required_level", "priority", "evidence"):
			value = skill.get(field)
			if value not in (None, ""):
				merged_skill[field] = value

	return list(merged.values())[:12]


def analyze_vaga(description: str, catalog_skills: Iterable[str] | None = None) -> Dict[str, Any]:
	prompt = _load_prompt_template().replace("{description}", description)
	prompt = prompt.replace("{catalog_skills}", _normalize_catalog_skills(catalog_skills))
	response = ask_hf(prompt, max_tokens=1024)

	try:
		parsed = _normalize_analysis(_parse_model_response(response))
	except Exception:
		parsed = {"summary": response, "job_skills": [], "skills": []}

	detected_skills = _extract_catalog_skills(catalog_skills, description)
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

	try:
		vaga = VagaAnalysis(**parsed)
		return vaga.model_dump()
	except Exception:
		return parsed


def analyze_skills(description: str) -> Dict[str, Any]:
	return analyze_vaga(description)
