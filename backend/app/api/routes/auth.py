"""Authentication routes: login, refresh, logout."""

import hashlib
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.api.deps import get_database
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_access_token,
    verify_password,
)
from app.models.refresh_tokens import RefreshToken
from app.repositories import user_repo
from app.schemas.user import AuthResponse, LoginRequest, UserRead

router = APIRouter(prefix="/auth", tags=["auth"])

_COOKIE_NAME = "refresh_token"
_REMEMBER_ME_DAYS = 30
_DEFAULT_DAYS = 1


def _set_refresh_cookie(response: JSONResponse, token: str, days: int) -> None:
    response.set_cookie(
        key=_COOKIE_NAME,
        value=token,
        httponly=True,
        secure=True,  
        samesite="lax",
        max_age=days * 86400,
        path="/",
    )


def _hash_token(raw: str) -> str:
    return hashlib.sha256(raw.encode()).hexdigest()


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: Session = Depends(get_database)) -> JSONResponse:
    """Validate credentials, issue access token and set refresh cookie."""

    user = user_repo.get_user_by_email(db, str(payload.email))
    if not user or not verify_password(payload.password, str(user.password)):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos.",
        )

    # Gera refresh token
    raw_token, token_hash = create_refresh_token()
    days = _REMEMBER_ME_DAYS if payload.rememberMe else _DEFAULT_DAYS
    expires_at = datetime.now(timezone.utc) + timedelta(days=days)

    db_token = RefreshToken(
        user_id=str(user.id),
        token_hash=token_hash,
        expires_at=expires_at,
        created_at=datetime.now(timezone.utc),
    )
    db.add(db_token)
    db.commit()

    access_token = create_access_token(str(user.id))
    usuario = UserRead(id=str(user.id), name=str(user.name), email=str(user.email))

    response = JSONResponse(
        content={"accessToken": access_token, "usuario": usuario.model_dump()}
    )
    _set_refresh_cookie(response, raw_token, days)
    return response


@router.post("/refresh", response_model=AuthResponse)
def refresh(request: Request, db: Session = Depends(get_database)) -> JSONResponse:
    """Exchange a valid refresh cookie for a new access token."""

    raw_token = request.cookies.get(_COOKIE_NAME)
    if not raw_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token não encontrado.",
        )

    token_hash = _hash_token(raw_token)
    db_token = (
        db.query(RefreshToken)
        .filter(RefreshToken.token_hash == token_hash)
        .first()
    )

    if not db_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token inválido.",
        )

    expires_at = db_token.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if expires_at < datetime.now(timezone.utc):
        db.delete(db_token)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token expirado.",
        )

    user = user_repo.get_user_by_id(db, str(db_token.user_id))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário não encontrado.",
        )

    access_token = create_access_token(str(user.id))
    usuario = UserRead(id=str(user.id), name=str(user.name), email=str(user.email))

    return JSONResponse(
        content={"accessToken": access_token, "usuario": usuario.model_dump()}
    )


@router.post("/logout")
def logout(request: Request, db: Session = Depends(get_database)) -> JSONResponse:
    """Invalidate the refresh token and clear the cookie."""

    raw_token = request.cookies.get(_COOKIE_NAME)
    if raw_token:
        token_hash = _hash_token(raw_token)
        db_token = (
            db.query(RefreshToken)
            .filter(RefreshToken.token_hash == token_hash)
            .first()
        )
        if db_token:
            db.delete(db_token)
            db.commit()

    response = JSONResponse(content={"message": "Logout realizado com sucesso."})
    response.delete_cookie(key=_COOKIE_NAME, path="/")
    return response


@router.get("/me", response_model=UserRead)
def me(request: Request, db: Session = Depends(get_database)) -> UserRead:
    """Return the current user from the Authorization header."""

    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token não fornecido.",
        )

    token = auth_header.removeprefix("Bearer ").strip()

    try:
        user_id = decode_access_token(token)
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="access_token_expired",
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido.",
        )

    user = user_repo.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário não encontrado.",
        )

    return UserRead(id=str(user.id), name=str(user.name), email=str(user.email))