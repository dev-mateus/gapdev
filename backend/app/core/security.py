"""Security helpers."""

import logging
from datetime import datetime, timedelta

import jwt
from passlib.context import CryptContext

from app.core.config import settings


logger = logging.getLogger(__name__)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain: str) -> str:
	"""Hash a plain password using bcrypt."""

	return pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
	"""Verify a plain password against a stored hash.

	Returns False on any unexpected error so a corrupt or legacy hash never
	turns into an HTTP 500 on /auth/login.
	"""

	try:
		return pwd_context.verify(plain, hashed)
	except Exception:
		logger.exception("Falha ao verificar hash de senha")
		return False


def create_access_token(data: dict) -> str:
	"""Create a signed JWT access token."""

	payload = data.copy()
	payload["exp"] = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
	return jwt.encode(payload, settings.secret_key, algorithm="HS256")


def decode_access_token(token: str) -> dict:
	"""Decode and validate a JWT access token."""

	return jwt.decode(token, settings.secret_key, algorithms=["HS256"])
