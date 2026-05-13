"""Job schemas."""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class JobCreate(BaseModel):
	"""Payload to create a job."""

	company_name: str
	job_title: str
	description: str
	level: Optional[str] = "Junior"


class JobRead(JobCreate):
	"""Job response payload."""

	id: str
	user_id: str
	created_at: datetime

	model_config = {"from_attributes": True}


class JobUpdate(BaseModel):
	"""Payload to update a job."""

	company_name: Optional[str] = None
	job_title: Optional[str] = None
	description: Optional[str] = None
	level: Optional[str] = None
