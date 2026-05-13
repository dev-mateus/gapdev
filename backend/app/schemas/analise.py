"""Analise schemas."""

from pydantic import BaseModel
from typing import List, Optional


class AnaliseRequest(BaseModel):
    """Request payload for job analysis."""

    description: str
    job_id: Optional[str] = None


class SkillAnalysis(BaseModel):
    """Skill analysis from AI."""

    name: str
    required_level: Optional[str] = None
    importance: Optional[str] = None
    evidence: Optional[str] = None
    recommendation: Optional[str] = None


class AnaliseResponse(BaseModel):
    """Response payload from analysis."""

    summary: str
    skills: List[SkillAnalysis] = []
