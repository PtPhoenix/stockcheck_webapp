try:
    from pydantic import BaseModel, ConfigDict
except ImportError:  # pragma: no cover - fallback for Pydantic v1
    from pydantic import BaseModel

    ConfigDict = None


class SettingsOut(BaseModel):
    low_stock_popup_enabled: bool
    low_stock_pin_enabled: bool
    popup_cooldown_hours: int
    if ConfigDict:
        model_config = ConfigDict(from_attributes=True)
    else:
        class Config:
            orm_mode = True


class SettingsUpdate(BaseModel):
    low_stock_popup_enabled: bool | None = None
    low_stock_pin_enabled: bool | None = None
    popup_cooldown_hours: int | None = None
