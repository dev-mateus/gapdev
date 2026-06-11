"""User schemas."""

from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
	"""Payload for user creation."""

	name: str
	email: EmailStr
	password: str


class UserRead(BaseModel):
	"""Serialized user response."""

	id: str
	name: str
	email: EmailStr
	seniority_level: str | None = None

	model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
	"""Payload for user profile update."""

	name: str | None = None
	seniority_level: str | None = None
