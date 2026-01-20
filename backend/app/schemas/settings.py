from pydantic import BaseModel


class SettingsOut(BaseModel):
    low_stock_popup_enabled: bool
    low_stock_pin_enabled: bool
    popup_cooldown_hours: int

    class Config:
        orm_mode = True


class SettingsUpdate(BaseModel):
    low_stock_popup_enabled: bool | None = None
    low_stock_pin_enabled: bool | None = None
    popup_cooldown_hours: int | None = None
