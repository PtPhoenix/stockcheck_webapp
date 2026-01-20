from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth import router as auth_router
from app.api.movements import router as movements_router
from app.api.products import router as products_router
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

app.include_router(auth_router)
app.include_router(movements_router)
app.include_router(products_router)
app.include_router(stock_router)


@app.get("/ping")
def ping() -> dict:
    return {"status": "ok"}
