from sqlalchemy import Boolean, Column, DateTime, Integer
from sqlalchemy.sql import func

from app.db.base import Base


class Settings(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, index=True)
    low_stock_popup_enabled = Column(Boolean, default=True, nullable=False)
    low_stock_pin_enabled = Column(Boolean, default=True, nullable=False)
    popup_cooldown_hours = Column(Integer, default=24, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
