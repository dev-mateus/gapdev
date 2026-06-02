"""Study plan schemas."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class StudyPlanGenerateRequest(BaseModel):
	"""Payload used to generate a study plan for a job."""

	job_id: str
	force_regenerate: bool = False


class StudyPlanItemStatusUpdate(BaseModel):
	"""Payload used to update a plan item status."""

	status: str


class StudyPlanItemRead(BaseModel):
	"""Study plan item response."""

	id: str
	study_plan_id: str
	skill_id: str
	skill_name: str
	current_level: Optional[str] = None
	target_level: str
	priority: str
	reason: Optional[str] = None
	status: str
	created_at: datetime
	updated_at: datetime

	model_config = {"from_attributes": True}


class StudyPlanRead(BaseModel):
	"""Study plan response."""

	id: str
	user_id: str
	job_id: str
	status: str
	created_at: datetime
	updated_at: datetime
	items: list[StudyPlanItemRead] = []

	model_config = {"from_attributes": True}
