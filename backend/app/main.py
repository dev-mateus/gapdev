from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.user import router as user_router
from app.db.prisma_client import prisma

app = FastAPI()

app.state.prisma = prisma

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
    """Connect the Prisma client on application startup."""

    await app.state.prisma.connect()


@app.on_event("shutdown")
async def on_shutdown() -> None:
    """Disconnect the Prisma client on application shutdown."""

    await app.state.prisma.disconnect()


@app.get("/")
def read_root() -> dict[str, str]:
    return {"msg": "API rodando"}


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok", "message": "Backend conectado"}