from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.user import router as user_router
from app.db.base import Base
from app.db.session import engine

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_router)


@app.on_event("startup")
async def on_startup() -> None:
    """Prepare SQLAlchemy metadata on application startup."""

    Base.metadata.create_all(bind=engine)


@app.get("/")
def read_root() -> dict[str, str]:
    return {"msg": "API rodando"}


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok", "message": "Backend conectado"}