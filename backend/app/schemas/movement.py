from datetime import datetime
from typing import List, Optional

try:
    from pydantic import BaseModel, ConfigDict
except ImportError:  # pragma: no cover - fallback for Pydantic v1
    from pydantic import BaseModel

    ConfigDict = None


class MovementBase(BaseModel):
    product_id: int
    movement_type: str
    quantity: int
    note: Optional[str] = None


class MovementCreate(MovementBase):
    pass


class MovementOut(MovementBase):
    id: int
    created_by: int
    created_at: datetime
    if ConfigDict:
        model_config = ConfigDict(from_attributes=True)
    else:
        class Config:
            orm_mode = True


class MovementList(BaseModel):
    items: List[MovementOut]
    total: int
    skip: int
    limit: int
