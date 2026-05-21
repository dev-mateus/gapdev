"""Security helpers."""

from datetime import datetime, timedelta

import jwt
from passlib.context import CryptContext
from passlib.exc import UnknownHashError

from app.core.config import settings


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain: str) -> str:
	"""Hash a plain password using bcrypt."""

	return pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
	"""Verify a plain password against a stored hash."""

	try:
		return pwd_context.verify(plain, hashed)
	except (TypeError, ValueError, UnknownHashError):
		return False


def create_access_token(data: dict) -> str:
	"""Create a signed JWT access token."""

	payload = data.copy()
	payload["exp"] = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
	return jwt.encode(payload, settings.secret_key, algorithm="HS256")


def decode_access_token(token: str) -> dict:
	"""Decode and validate a JWT access token."""

	return jwt.decode(token, settings.secret_key, algorithms=["HS256"])
