"""User repository."""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user import UserCreate


def get_user_by_email(db: Session, email: str) -> User | None:
	"""Return a user by e-mail when found."""

	statement = select(User).where(User.email == email)
	return db.scalars(statement).first()


def list_users(db: Session) -> list[User]:
	"""Return all users."""

	statement = select(User).order_by(User.name.asc())
	return list(db.scalars(statement).all())


def create_user(db: Session, payload: UserCreate) -> User:
	"""Persist a new user and return it."""

	user = User(name=payload.name, email=str(payload.email), password=payload.password)
	db.add(user)
	db.commit()
	db.refresh(user)
	return user
