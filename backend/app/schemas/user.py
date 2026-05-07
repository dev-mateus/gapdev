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


class LoginRequest(BaseModel):
	"""Payload for login."""

	email: EmailStr
	password: str
	rememberMe: bool = False


class AuthResponse(BaseModel):
	"""Token + user info returned after login or refresh."""

	accessToken: str
	usuario: UserRead