"""User routes."""

from fastapi import APIRouter, Depends, status

from app.api.deps import get_prisma
from app.schemas.user import UserCreate, UserRead
from app.services import user_service
from prisma import Prisma

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=list[UserRead])
async def list_users(db: Prisma = Depends(get_prisma)) -> list[UserRead]:
	"""List all users."""

	return await user_service.list_users(db)


@router.post("", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def create_user(payload: UserCreate, db: Prisma = Depends(get_prisma)) -> UserRead:
	"""Create a new user."""

	return await user_service.create_user(db, payload)
