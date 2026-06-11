"""User service."""

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.user import User
from app.repositories import user_repo
from app.schemas.user import UserCreate, UserRead, UserUpdate


def _user_to_read(user: object) -> UserRead:
	"""Convert a SQLAlchemy user record into the public response schema."""

	return UserRead(
		id=str(getattr(user, "id")),
		name=str(getattr(user, "name")),
		email=str(getattr(user, "email")),
		seniority_level=getattr(user, "seniority_level", None),
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

	payload.password = hash_password(payload.password)
	created_user = user_repo.create_user(db, payload)
	return _user_to_read(created_user)


def get_user(db: Session, user: User) -> UserRead:
	"""Return the current user profile."""

	return _user_to_read(user)


def update_user(db: Session, user: User, payload: UserUpdate) -> UserRead:
	"""Update user profile fields."""

	data = payload.model_dump(exclude_unset=True)
	updated_user = user_repo.update_user_profile(db, user, data)
	return _user_to_read(updated_user)
