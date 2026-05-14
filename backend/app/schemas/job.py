"""Job schemas."""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class JobCreate(BaseModel):
	"""Payload to create a job."""

	company_name: str
	job_title: str
	description: str
	level: Optional[str] = "Junior"
	compatibility: Optional[int] = 0


class JobRead(JobCreate):
	"""Job response payload."""

	id: str
	user_id: str
	created_at: datetime

	model_config = {"from_attributes": True}


class JobWithSkillsRead(BaseModel):
	"""Job response with skills for frontend."""

	id: str
	user_id: str
	company_name: str
	job_title: str
	description: str
	level: str
	compatibilidade: int
	tecnologias: List[str]
	created_at: datetime


class JobUpdate(BaseModel):
	"""Payload to update a job."""

	company_name: Optional[str] = None
	job_title: Optional[str] = None
	description: Optional[str] = None
	level: Optional[str] = None
	compatibility: Optional[int] = None


class JobCompatibilityUpdate(BaseModel):
	"""Payload to update compatibility for a job."""

	compatibility: int = Field(ge=0, le=100)
