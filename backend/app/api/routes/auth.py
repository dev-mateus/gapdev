"""Authentication routes."""

from uuid import uuid4

import httpx

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from app.schemas.user import UserCreate 

from app.api.deps import get_database
from app.core.security import (
	create_access_token,
	verify_password,
	hash_password,
)
from app.repositories import user_repo


router = APIRouter(prefix="/auth", tags=["auth"])


class LoginRequest(BaseModel):
	"""Login payload."""

	email: EmailStr
	password: str


class GoogleLoginRequest(BaseModel):
	"""Google login payload."""

	google_token: str


@router.post("/login")
def login(
	payload: LoginRequest,
	db: Session = Depends(get_database),
) -> dict[str, str]:
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


@router.post("/google")
def google_login(
	payload: GoogleLoginRequest,
	db: Session = Depends(get_database),
) -> dict[str, str]:
	"""Authenticate user with Google OAuth token."""

	try:
		response = httpx.get(
			"https://www.googleapis.com/oauth2/v2/userinfo",
			headers={
				"Authorization": f"Bearer {payload.google_token}",
			},
			timeout=10.0,
		)
	except httpx.TimeoutException:
		raise HTTPException(
			status_code=status.HTTP_504_GATEWAY_TIMEOUT,
			detail="Timeout ao comunicar com o Google. Tente novamente.",
		)
	except httpx.RequestError as exc:
		raise HTTPException(
			status_code=status.HTTP_502_BAD_GATEWAY,
			detail=f"Erro ao comunicar com o Google: {exc}",
		)

	if response.status_code == 401:
		raise HTTPException(
			status_code=status.HTTP_401_UNAUTHORIZED,
			detail="Token do Google invalido ou expirado.",
		)

	if response.status_code != 200:
		raise HTTPException(
			status_code=status.HTTP_401_UNAUTHORIZED,
			detail=f"Google retornou status {response.status_code}.",
		)

	user_data = response.json()

	email = user_data.get("email")
	name = user_data.get("name")

	if not email:
		raise HTTPException(
			status_code=status.HTTP_400_BAD_REQUEST,
			detail="Google nao retornou email do usuario",
		)

	user = user_repo.get_user_by_email(db, email)

	if not user:
		user = user_repo.create_user(
			db=db,
			payload=UserCreate(
				name=name or "Usuario Google",
				email=email,
				password=hash_password(str(uuid4())),
			),
		)

	return {
		"access_token": create_access_token({"sub": str(user.id)}),
		"token_type": "bearer",
	}