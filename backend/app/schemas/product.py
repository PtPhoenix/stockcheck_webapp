from datetime import datetime
from typing import List, Optional

try:
    from pydantic import BaseModel, ConfigDict, field_validator
except ImportError:  # pragma: no cover - fallback for Pydantic v1
    from pydantic import BaseModel, validator

    ConfigDict = None
    field_validator = None


class ProductBase(BaseModel):
    name: str
    unit: str
    min_stock: int = 0
    low_stock_enabled: bool = True
    is_active: bool = True

    if field_validator:
        @field_validator("min_stock")
        @classmethod
        def validate_min_stock(cls, value):
            if value < 0:
                raise ValueError("Min stock must be 0 or higher.")
            return value
    else:
        @validator("min_stock")
        def validate_min_stock(cls, value):
            if value < 0:
                raise ValueError("Min stock must be 0 or higher.")
            return value


class ProductCreate(ProductBase):
    initial_stock: int = 0

    if field_validator:
        @field_validator("initial_stock")
        @classmethod
        def validate_initial_stock(cls, value):
            if value < 0:
                raise ValueError("Initial stock must be 0 or higher.")
            return value
    else:
        @validator("initial_stock")
        def validate_initial_stock(cls, value):
            if value < 0:
                raise ValueError("Initial stock must be 0 or higher.")
            return value


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    unit: Optional[str] = None
    min_stock: Optional[int] = None
    low_stock_enabled: Optional[bool] = None
    is_active: Optional[bool] = None

    if field_validator:
        @field_validator("min_stock")
        @classmethod
        def validate_min_stock(cls, value):
            if value is None:
                return value
            if value < 0:
                raise ValueError("Min stock must be 0 or higher.")
            return value
    else:
        @validator("min_stock")
        def validate_min_stock(cls, value):
            if value is None:
                return value
            if value < 0:
                raise ValueError("Min stock must be 0 or higher.")
            return value


class ProductOut(ProductBase):
    id: int
    created_at: datetime
    if ConfigDict:
        model_config = ConfigDict(from_attributes=True)
    else:
        class Config:
            orm_mode = True


class ProductList(BaseModel):
    items: List[ProductOut]
    total: int
    skip: int
    limit: int
