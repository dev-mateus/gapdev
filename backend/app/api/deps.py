"""API dependencies."""

from collections.abc import Generator

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.user import User
from app.repositories import user_repo


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_database() -> Generator[Session, None, None]:
	"""Provide a SQLAlchemy session."""

	yield from get_db()


def get_current_user(
	token: str = Depends(oauth2_scheme),
	db: Session = Depends(get_database),
) -> User:
	"""Return the authenticated user from a bearer token."""

	try:
		payload = decode_access_token(token)
	except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
		raise HTTPException(
			status_code=status.HTTP_401_UNAUTHORIZED,
			detail="Token invalido ou expirado",
		) from None

	user_id = payload.get("sub")
	if not user_id:
		raise HTTPException(
			status_code=status.HTTP_401_UNAUTHORIZED,
			detail="Token invalido ou expirado",
		)

	user = user_repo.get_user_by_id(db, str(user_id))
	if not user:
		raise HTTPException(
			status_code=status.HTTP_401_UNAUTHORIZED,
			detail="Usuario nao encontrado",
		)

	return user
