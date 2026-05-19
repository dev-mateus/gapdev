"""User Skill schemas."""

from typing import Optional

from pydantic import BaseModel

from app.models.user_skill import SkillLevel, SkillPriority  # ← adicionar


class UserSkillCreate(BaseModel):
    """Payload to create a user skill."""

    job_id: str
    skill_name: str
    level: SkillLevel          # ← era str
    priority: SkillPriority    # ← era str


class UserSkillRead(UserSkillCreate):
    """User skill response payload."""

    id: str
    user_id: str

    model_config = {"from_attributes": True, "use_enum_values": True}  # ← adicionar use_enum_values


class UserSkillUpdate(BaseModel):
    """Payload to update a user skill."""

    skill_name: Optional[str] = None
    level: Optional[SkillLevel] = None      # ← era Optional[str]
    priority: Optional[SkillPriority] = None  # ← era Optional[str]