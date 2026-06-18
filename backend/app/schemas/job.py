"""Job schemas."""

from datetime import datetime
from app.schemas.user_skill import UserSkillRead

from typing import List, Optional

from pydantic import BaseModel, Field

from app.models.job import JobLevel  # ← adicionar


class JobCreate(BaseModel):
    """Payload to create a job."""

    company_name: str = Field(..., min_length=1, max_length=200)
    job_title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=10, max_length=15000)
    level: Optional[JobLevel] = JobLevel.Junior
    compatibility: Optional[int] = Field(0, ge=0, le=100)


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

class JobWithSkillsRead(JobRead):
    """Job response payload with skills."""

    skills: List[UserSkillRead] = []

    model_config = {
        "from_attributes": True,
        "use_enum_values": True,
    }
    