"""Job skill schemas."""

from typing import Optional

from pydantic import BaseModel


class JobSkillCreate(BaseModel):
	"""Payload to create a job skill."""

	job_id: str
	skill_id: Optional[str] = None
	raw_name: Optional[str] = None
	required_level: str = "Basic"
	priority: str = "desirable"
