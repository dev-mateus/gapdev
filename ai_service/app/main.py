"""FastMCP entrypoint for the AI service."""

from pathlib import Path
import sys

from fastmcp import FastMCP


REPO_ROOT = Path(__file__).resolve().parents[2]
if str(REPO_ROOT) not in sys.path:
	sys.path.insert(0, str(REPO_ROOT))

from ai_service.app.agents.analise_vaga import analyze_skills

mcp = FastMCP("gapdev-ai-service")

@mcp.tool()
def analisar_vaga(description: str) -> dict:
	"""Analisa a descrição da vaga e retorna um resumo estruturado focado em habilidades."""

	return analyze_skills(description)


if __name__ == "__main__":
	mcp.run()
