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

	model_config = {"from_attributes": True}
