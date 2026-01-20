from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class ProductBase(BaseModel):
    name: str
    unit: str
    min_stock: int = 0
    low_stock_enabled: bool = True
    is_active: bool = True


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    unit: Optional[str] = None
    min_stock: Optional[int] = None
    low_stock_enabled: Optional[bool] = None
    is_active: Optional[bool] = None


class ProductOut(ProductBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True


class ProductList(BaseModel):
    items: List[ProductOut]
    total: int
    skip: int
    limit: int
