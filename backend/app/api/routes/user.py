"""User routes."""

from fastapi import APIRouter, Depends, Request, status
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_database
from app.models.user import User
from app.schemas.user import UserCreate, UserRead, UserUpdate
from app.services import user_service

router = APIRouter(prefix="/users", tags=["users"])

limiter = Limiter(key_func=get_remote_address)


@router.get("/me", response_model=UserRead)
def get_me(
	db: Session = Depends(get_database),
	current_user: User = Depends(get_current_user),
) -> UserRead:
	"""Return the authenticated user's profile."""

	return user_service.get_user(db, current_user)


@router.patch("/me", response_model=UserRead)
def update_me(
	payload: UserUpdate,
	db: Session = Depends(get_database),
	current_user: User = Depends(get_current_user),
) -> UserRead:
	"""Update the authenticated user's profile."""

	return user_service.update_user(db, current_user, payload)


@router.get("", response_model=list[UserRead])
def list_users(
	db: Session = Depends(get_database),
	current_user: User = Depends(get_current_user),
) -> list[UserRead]:
	"""List all users."""

	return user_service.list_users(db)


@router.post("", response_model=UserRead, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
def create_user(
	request: Request,
	payload: UserCreate,
	db: Session = Depends(get_database),
) -> UserRead:
	"""Create a new user."""

	return user_service.create_user(db, payload)