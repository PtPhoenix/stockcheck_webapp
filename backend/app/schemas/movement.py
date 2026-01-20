from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


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

    class Config:
        orm_mode = True


class MovementList(BaseModel):
    items: List[MovementOut]
    total: int
    skip: int
    limit: int
