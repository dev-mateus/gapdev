"""User Skill schemas."""

from typing import Optional

from pydantic import BaseModel


class UserSkillCreate(BaseModel):
    """Payload to create a user skill."""

    skill_id: Optional[str] = None
    skill_name: Optional[str] = None
    level: str = "Beginner"


class UserSkillRead(UserSkillCreate):
    """User skill response payload."""

    id: str
    user_id: str
    skill_id: str
    skill_name: str
    learned_from_module: bool = False

    model_config = {"from_attributes": True}


class SkillCatalogRead(BaseModel):
    """Catalog skill payload used by technology search."""

    id: str
    name: str
    category: Optional[str] = None
    description: Optional[str] = None


class UserSkillUpdate(BaseModel):
    """Payload to update a user skill."""

    level: Optional[str] = None
