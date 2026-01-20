from datetime import datetime
from typing import List

from pydantic import BaseModel


class StockOverviewItem(BaseModel):
    id: int
    name: str
    unit: str
    min_stock: int
    low_stock_enabled: bool
    is_active: bool
    created_at: datetime
    balance: int
    low_stock: bool


class StockOverviewList(BaseModel):
    items: List[StockOverviewItem]
    total: int
    skip: int
    limit: int
