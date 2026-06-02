"""FastMCP entrypoint for the AI service."""

from pathlib import Path
import sys

from fastmcp import FastMCP


REPO_ROOT = Path(__file__).resolve().parents[2]
if str(REPO_ROOT) not in sys.path:
	sys.path.insert(0, str(REPO_ROOT))

from ai_service.app.agents.analise_vaga import analyze_skills
from ai_service.app.agents.plano_estudo import generate_study_plan

mcp = FastMCP("gapdev-ai-service")

@mcp.tool()
def analisar_vaga(description: str) -> dict:
	"""Analisa a descrição da vaga e retorna um resumo estruturado focado em habilidades."""

	return analyze_skills(description)


@mcp.tool()
def gerar_plano_estudo(job_context: dict, job_skills: list[dict], user_skills: list[dict]) -> dict:
	"""Gera um plano de estudos estruturado a partir da vaga e das habilidades do usuario."""

	return generate_study_plan(job_context, job_skills, user_skills)


if __name__ == "__main__":
	mcp.run()
