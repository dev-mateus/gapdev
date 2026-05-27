"""Response schema definitions."""

from typing import List, Optional

from pydantic import BaseModel


class SkillAnalysis(BaseModel):
	name: str
	required_level: Optional[str] = None
	importance: Optional[str] = None
	evidence: Optional[str] = None
	recommendation: Optional[str] = None


class JobSkillAnalysis(BaseModel):
	skill_id: Optional[str] = None
	skill_name: Optional[str] = None
	raw_name: Optional[str] = None
	required_level: Optional[str] = None
	priority: Optional[str] = None


class VagaAnalysis(BaseModel):
	summary: str
	job_skills: List[JobSkillAnalysis] = []
	skills: List[SkillAnalysis] = []
