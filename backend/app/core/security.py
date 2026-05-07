"""Security helpers."""

import hashlib
import secrets
from datetime import datetime, timedelta, timezone

import jwt
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain: str) -> str:
    """Return a bcrypt hash for the given plain-text password."""
    return pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    """Return True when the plain password matches the stored hash."""
    return pwd_context.verify(plain, hashed)


def create_access_token(user_id: str) -> str:
    """Create a short-lived JWT access token (15 min by default)."""
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.access_token_expire_minutes
    )
    payload = {"sub": user_id, "exp": expire}
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)


def decode_access_token(token: str) -> str:
    """Decode the JWT and return the user_id (sub claim).

    Raises jwt.ExpiredSignatureError or jwt.InvalidTokenError on failure.
    """
    payload = jwt.decode(
        token, settings.secret_key, algorithms=[settings.algorithm]
    )
    return str(payload["sub"])


def create_refresh_token() -> tuple[str, str]:
    """Return (raw_token, token_hash) for a new refresh token."""
    raw = secrets.token_urlsafe(64)
    hashed = hashlib.sha256(raw.encode()).hexdigest()
    return raw, hashed