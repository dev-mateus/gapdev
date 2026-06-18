"""User schemas."""

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
	"""Payload for user creation."""

	name: str = Field(..., min_length=2, max_length=100)
	email: EmailStr
	password: str = Field(..., min_length=6, max_length=32)


class UserRead(BaseModel):
	"""Serialized user response."""

	id: str
	name: str
	email: EmailStr
	seniority_level: str | None = None

	model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
	"""Payload for user profile update."""

	name: str | None = Field(None, min_length=2, max_length=100)
	seniority_level: str | None = None
