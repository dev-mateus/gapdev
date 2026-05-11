from pydantic import BaseModel
from typing import List, Optional


class AnaliseRequest(BaseModel):
    description: str


class SkillAnalysis(BaseModel):
    name: str
    required_level: Optional[str] = None
    importance: Optional[str] = None
    evidence: Optional[str] = None
    recommendation: Optional[str] = None


class AnaliseResponse(BaseModel):
    summary: str
    skills: List[SkillAnalysis] = []
"""Analise schemas."""
