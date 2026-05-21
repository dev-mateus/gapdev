"""Authentication routes."""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.api.deps import get_database
from app.core.security import create_access_token, verify_password
from app.repositories import user_repo


router = APIRouter(prefix="/auth", tags=["auth"])


class LoginRequest(BaseModel):
	"""Login payload."""

	email: EmailStr
	password: str


@router.post("/login")
def login(payload: LoginRequest, db: Session = Depends(get_database)) -> dict[str, str]:
	"""Authenticate a user and return a bearer token."""

	user = user_repo.get_user_by_email(db, str(payload.email))
	if not user or not verify_password(payload.password, str(user.password)):
		raise HTTPException(
			status_code=status.HTTP_401_UNAUTHORIZED,
			detail="Credenciais invalidas",
		)

	return {
		"access_token": create_access_token({"sub": str(user.id)}),
		"token_type": "bearer",
	}
