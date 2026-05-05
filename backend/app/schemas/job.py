"""Job schemas."""

from datetime import datetime

from pydantic import BaseModel


class JobCreate(BaseModel):
	"""Payload to create a job."""

	company_name: str
	job_title: str
	description: str


class JobRead(JobCreate):
	"""Job response payload."""

	id: str
	user_id: str
	created_at: datetime

	model_config = {"from_attributes": True}
