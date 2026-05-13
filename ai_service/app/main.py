"""FastMCP entrypoint for the AI service."""

from fastmcp import FastMCP

from app.tools.llm_client import ask_hf
from app.agents.analise_vaga import analyze_skills

mcp = FastMCP("gapdev-ai-service")


@mcp.tool()
def testar_hugging_face(prompt: str = "What is the capital of France?") -> str:
	"""Faz uma chamada simples de teste ao modelo do Hugging Face."""

	return ask_hf(prompt)


@mcp.tool()
def analisar_vaga(description: str) -> dict:
	"""Analisa a descrição da vaga e retorna um resumo estruturado focado em habilidades."""

	return analyze_skills(description)


if __name__ == "__main__":
	mcp.run()
