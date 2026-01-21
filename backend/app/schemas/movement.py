from datetime import datetime
from typing import List, Optional

try:
    from pydantic import BaseModel, ConfigDict, field_validator
except ImportError:  # pragma: no cover - fallback for Pydantic v1
    from pydantic import BaseModel, validator

    ConfigDict = None
    field_validator = None


class MovementBase(BaseModel):
    product_id: int
    movement_type: str
    quantity: int
    note: Optional[str] = None

    if field_validator:
        @field_validator("quantity")
        @classmethod
        def validate_quantity(cls, value):
            if value <= 0:
                raise ValueError("Quantity must be greater than 0.")
            return value

        @field_validator("movement_type")
        @classmethod
        def validate_movement_type(cls, value):
            if value not in {"IN", "OUT"}:
                raise ValueError("Movement type must be IN or OUT.")
            return value
    else:
        @validator("quantity")
        def validate_quantity(cls, value):
            if value <= 0:
                raise ValueError("Quantity must be greater than 0.")
            return value

        @validator("movement_type")
        def validate_movement_type(cls, value):
            if value not in {"IN", "OUT"}:
                raise ValueError("Movement type must be IN or OUT.")
            return value


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
