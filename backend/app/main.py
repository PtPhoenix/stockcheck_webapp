from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.auth import router as auth_router
from app.api.export import router as export_router
from app.api.movements import router as movements_router
from app.api.products import router as products_router
from app.api.settings import router as settings_router
from app.api.stock import router as stock_router
from app.core.config import settings


app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api")
app.include_router(export_router, prefix="/api")
app.include_router(movements_router, prefix="/api")
app.include_router(products_router, prefix="/api")
app.include_router(settings_router, prefix="/api")
app.include_router(stock_router, prefix="/api")

static_dir = Path(__file__).resolve().parent / "static"
app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")


@app.get("/api/ping")
def ping() -> dict:
    return {"status": "ok"}
