"""Agent for vaga analysis."""

from pathlib import Path
from typing import Any, Dict
import json

from app.tools.llm_client import ask_hf
from app.schemas.resposta import VagaAnalysis

PROMPT_PATH = Path(__file__).resolve().parents[1] / "prompts" / "analise_prompt.txt"


def _load_prompt_template() -> str:
	return PROMPT_PATH.read_text(encoding="utf-8")


def _unwrap_json_payload(payload: Any) -> Any:
	current = payload
	for _ in range(3):
		if isinstance(current, str):
			text = current.strip()
			if not text.startswith("{") and not text.startswith("["):
				return current
			current = json.loads(text)
			continue

		if isinstance(current, dict):
			summary_value = current.get("summary")
			if isinstance(summary_value, str):
				inner_text = summary_value.strip()
				if inner_text.startswith("{") and inner_text.endswith("}"):
					try:
						inner_payload = json.loads(inner_text)
						if isinstance(inner_payload, dict) and "summary" in inner_payload and "skills" in inner_payload:
							return inner_payload
					except Exception:
						pass
			if "summary" in current and "skills" in current:
				return current

		return current

	return current


def analyze_skills(description: str) -> Dict[str, Any]:
	prompt = _load_prompt_template().replace("{description}", description)
	response = ask_hf(prompt, max_tokens=1024)

	try:
		parsed = _unwrap_json_payload(json.loads(response))
	except Exception:
		parsed = {"summary": response, "skills": []}

	try:
		vaga = VagaAnalysis(**parsed)
		return vaga.dict()
	except Exception:
		return parsed
