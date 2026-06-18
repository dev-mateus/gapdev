"""Analise schemas."""

from typing import List, Optional

from pydantic import BaseModel, Field


class AnaliseRequest(BaseModel):
    """Request payload for job analysis."""

    description: str = Field(..., min_length=20, max_length=15000)
    job_id: Optional[str] = None


class SkillAnalysis(BaseModel):
    """Legacy skill analysis from AI."""

    skill_id: Optional[str] = None
    name: str
    required_level: Optional[str] = None
    importance: Optional[str] = None


class JobSkillAnalysis(BaseModel):
    """Job skill analysis from AI."""

    skill_id: Optional[str] = None
    skill_name: Optional[str] = None
    raw_name: Optional[str] = None
    required_level: Optional[str] = None
    priority: Optional[str] = None


class AnaliseResponse(BaseModel):
    """Response payload from analysis."""

    summary: str
    level: Optional[str] = None
    job_skills: List[JobSkillAnalysis] = Field(default_factory=list)
    skills: List[SkillAnalysis] = Field(default_factory=list)
