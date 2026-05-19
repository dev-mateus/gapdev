"""Job schemas."""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field

from app.models.job import JobLevel  # ← adicionar


class JobCreate(BaseModel):
    """Payload to create a job."""

    company_name: str
    job_title: str
    description: str
    level: Optional[JobLevel] = JobLevel.Junior  # ← era Optional[str]
    compatibility: Optional[int] = 0


class JobRead(JobCreate):
    """Job response payload."""

    id: str
    user_id: str
    created_at: datetime

    model_config = {"from_attributes": True, "use_enum_values": True}  # ← adicionar use_enum_values


# JobWithSkillsRead e JobUpdate sem mudança...

class JobUpdate(BaseModel):
    """Payload to update a job."""

    company_name: Optional[str] = None
    job_title: Optional[str] = None
    description: Optional[str] = None
    level: Optional[JobLevel] = None  # ← era Optional[str]
    compatibility: Optional[int] = None


class JobCompatibilityUpdate(BaseModel):
    """Payload to update compatibility for a job."""

    compatibility: int = Field(ge=0, le=100)