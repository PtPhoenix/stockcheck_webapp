from datetime import datetime
from typing import List, Optional

try:
    from pydantic import BaseModel, ConfigDict
except ImportError:  # pragma: no cover - fallback for Pydantic v1
    from pydantic import BaseModel

    ConfigDict = None


class ProductBase(BaseModel):
    name: str
    unit: str
    min_stock: int = 0
    low_stock_enabled: bool = True
    is_active: bool = True


class ProductCreate(ProductBase):
    initial_stock: int = 0


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    unit: Optional[str] = None
    min_stock: Optional[int] = None
    low_stock_enabled: Optional[bool] = None
    is_active: Optional[bool] = None


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
