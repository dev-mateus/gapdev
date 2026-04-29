"""User service."""

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories import user_repo
from app.schemas.user import UserCreate, UserRead


def _user_to_read(user: object) -> UserRead:
	"""Convert a SQLAlchemy user record into the public response schema."""

	return UserRead(
		id=str(getattr(user, "id")),
		name=str(getattr(user, "name")),
		email=str(getattr(user, "email")),
	)


def list_users(db: Session) -> list[UserRead]:
	"""List users."""

	users = user_repo.list_users(db)
	return [_user_to_read(user) for user in users]


def create_user(db: Session, payload: UserCreate) -> UserRead:
	"""Create a user if e-mail is not already in use."""

	existing_user = user_repo.get_user_by_email(db, str(payload.email))
	if existing_user:
		raise HTTPException(
			status_code=status.HTTP_409_CONFLICT,
			detail="E-mail ja cadastrado.",
		)

	created_user = user_repo.create_user(db, payload)
	return _user_to_read(created_user)
