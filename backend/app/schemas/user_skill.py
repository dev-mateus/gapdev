"""User Skill schemas."""

from typing import Optional

from pydantic import BaseModel


class UserSkillCreate(BaseModel):
    """Payload to create a user skill."""

    job_id: str
    skill_name: str
    level: str
    priority: str


class UserSkillRead(UserSkillCreate):
    """User skill response payload."""

    id: str
    user_id: str

    model_config = {"from_attributes": True}


class UserSkillUpdate(BaseModel):
    """Payload to update a user skill."""

    skill_name: Optional[str] = None
    level: Optional[str] = None
    priority: Optional[str] = None
