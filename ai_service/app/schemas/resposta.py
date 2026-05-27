"""Response schema definitions."""

from pydantic import BaseModel
from typing import List, Optional


class SkillAnalysis(BaseModel):
	name: str
	required_level: Optional[str] = None
	importance: Optional[str] = None
	evidence: Optional[str] = None
	recommendation: Optional[str] = None


class VagaAnalysis(BaseModel):
	summary: str
	skills: List[SkillAnalysis] = []
