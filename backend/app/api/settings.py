from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.protected import router as protected_router
from app.db.deps import get_db
from app.models.settings import Settings
from app.schemas.settings import SettingsOut, SettingsUpdate


router = APIRouter(
    prefix="/settings",
    tags=["settings"],
    dependencies=protected_router.dependencies,
)


def get_or_create_settings(db: Session) -> Settings:
    settings = db.query(Settings).order_by(Settings.id).first()
    if settings:
        return settings

    settings = Settings()
    db.add(settings)
    db.commit()
    db.refresh(settings)
    return settings


@router.get("", response_model=SettingsOut)
def get_settings(db: Session = Depends(get_db)) -> SettingsOut:
    return get_or_create_settings(db)


@router.put("", response_model=SettingsOut)
def update_settings(payload: SettingsUpdate, db: Session = Depends(get_db)) -> SettingsOut:
    settings = get_or_create_settings(db)
    update_data = payload.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(settings, field, value)
    db.commit()
    db.refresh(settings)
    return settings
