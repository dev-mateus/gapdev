"""User service."""

from fastapi import HTTPException, status
from prisma import Prisma

from app.repositories import user_repo
from app.schemas.user import UserCreate, UserRead


def _user_to_read(user: object) -> UserRead:
	"""Convert a Prisma user record into the public response schema."""

	if isinstance(user, dict):
		data = user
	else:
		data = {
			"id": getattr(user, "id"),
			"name": getattr(user, "name"),
			"email": getattr(user, "email"),
		}

	return UserRead(id=str(data["id"]), name=str(data["name"]), email=str(data["email"]))


async def list_users(db: Prisma) -> list[UserRead]:
	"""List users."""

	users = await user_repo.list_users(db)
	return [_user_to_read(user) for user in users]


async def create_user(db: Prisma, payload: UserCreate) -> UserRead:
	"""Create a user if e-mail is not already in use."""

	existing_user = await user_repo.get_user_by_email(db, str(payload.email))
	if existing_user:
		raise HTTPException(
			status_code=status.HTTP_409_CONFLICT,
			detail="E-mail ja cadastrado.",
		)

	created_user = await user_repo.create_user(db, payload)
	return _user_to_read(created_user)
