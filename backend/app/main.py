from pathlib import Path
import sys
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware


REPO_ROOT = Path(__file__).resolve().parents[2]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from app.api.routes.auth import router as auth_router
from app.api.routes.job import router as job_router
from app.api.routes.user import router as user_router
from app.api.routes.analise import router as analise_router
from app.api.routes.user_skill import router as user_skill_router
from app.api.routes.study_plan import router as study_plan_router
from app.db.base import Base
from app.db.seed_skills import seed_skills_catalog
from app.db.session import SessionLocal, engine

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://gapdev.vercel.app",
]

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _cors_headers(request: Request) -> dict[str, str]:
    origin = request.headers.get("origin", "")
    if origin in ALLOWED_ORIGINS:
        return {
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Credentials": "true",
        }
    return {}


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=500,
        content={"detail": "Erro interno do servidor."},
        headers=_cors_headers(request),
    )


app.include_router(auth_router)
app.include_router(user_router)
app.include_router(job_router)
app.include_router(user_skill_router)
app.include_router(analise_router)
app.include_router(study_plan_router)


@app.on_event("startup")
async def on_startup() -> None:
    """Prepare SQLAlchemy metadata on application startup."""

    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed_skills_catalog(db)


@app.get("/")
def read_root() -> dict[str, str]:
    return {"msg": "API rodando"}


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok", "message": "Backend conectado"}
