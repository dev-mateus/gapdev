"""User repository."""

from prisma import Prisma

from app.schemas.user import UserCreate


async def get_user_by_email(db: Prisma, email: str):
	"""Return a user by e-mail when found."""

	return await db.user.find_unique(where={"email": email})


async def list_users(db: Prisma):
	"""Return all users."""

	return await db.user.find_many(order={"name": "asc"})


async def create_user(db: Prisma, payload: UserCreate):
	"""Persist a new user and return it."""

	return await db.user.create(
		data={
			"name": payload.name,
			"email": str(payload.email),
			"password": payload.password,
		},
	)
