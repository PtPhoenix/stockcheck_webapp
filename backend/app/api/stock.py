from fastapi import APIRouter, Depends, Query
from sqlalchemy import case, func
from sqlalchemy.orm import Session

from app.api.protected import router as protected_router
from app.db.deps import get_db
from app.models.product import Product
from app.models.stock_movement import StockMovement
from app.schemas.stock import StockOverviewItem, StockOverviewList


router = APIRouter(
    prefix="/stock",
    tags=["stock"],
    dependencies=protected_router.dependencies,
)


@router.get("/overview", response_model=StockOverviewList)
def stock_overview(
    search: str | None = Query(None, min_length=1),
    low_stock_only: bool = False,
    active_only: bool = True,
    sort_by: str = Query("name", pattern="^(name|balance)$"),
    sort_dir: str = Query("asc", pattern="^(asc|desc)$"),
    low_stock_first: bool = False,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
) -> StockOverviewList:
    in_sum = func.coalesce(
        func.sum(case((StockMovement.movement_type == "IN", StockMovement.quantity), else_=0)),
        0,
    )
    out_sum = func.coalesce(
        func.sum(case((StockMovement.movement_type == "OUT", StockMovement.quantity), else_=0)),
        0,
    )
    movement_totals = (
        db.query(
            StockMovement.product_id.label("product_id"),
            in_sum.label("in_sum"),
            out_sum.label("out_sum"),
        )
        .group_by(StockMovement.product_id)
        .subquery()
    )

    balance_expr = func.coalesce(movement_totals.c.in_sum, 0) - func.coalesce(
        movement_totals.c.out_sum, 0
    )
    low_stock_expr = case(
        (
            (Product.low_stock_enabled.is_(True)) & (balance_expr <= Product.min_stock),
            True,
        ),
        else_=False,
    )

    query = (
        db.query(
            Product.id,
            Product.name,
            Product.unit,
            Product.min_stock,
            Product.low_stock_enabled,
            Product.is_active,
            Product.created_at,
            balance_expr.label("balance"),
            low_stock_expr.label("low_stock"),
        )
        .outerjoin(movement_totals, movement_totals.c.product_id == Product.id)
    )

    if search:
        query = query.filter(Product.name.ilike(f"%{search}%"))
    if active_only:
        query = query.filter(Product.is_active.is_(True))
    if low_stock_only:
        query = query.filter(low_stock_expr.is_(True))

    if low_stock_first:
        query = query.order_by(low_stock_expr.desc())

    sort_columns = {"name": Product.name, "balance": balance_expr}
    sort_column = sort_columns[sort_by]
    if sort_dir == "desc":
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())

    total = query.count()
    rows = query.offset(skip).limit(limit).all()
    items = [
        StockOverviewItem(
            id=row.id,
            name=row.name,
            unit=row.unit,
            min_stock=row.min_stock,
            low_stock_enabled=row.low_stock_enabled,
            is_active=row.is_active,
            created_at=row.created_at,
            balance=int(row.balance or 0),
            low_stock=bool(row.low_stock),
        )
        for row in rows
    ]
    return StockOverviewList(items=items, total=total, skip=skip, limit=limit)


@router.get("/low/count")
def low_stock_count(db: Session = Depends(get_db)) -> dict:
    in_sum = func.coalesce(
        func.sum(case((StockMovement.movement_type == "IN", StockMovement.quantity), else_=0)),
        0,
    )
    out_sum = func.coalesce(
        func.sum(case((StockMovement.movement_type == "OUT", StockMovement.quantity), else_=0)),
        0,
    )
    movement_totals = (
        db.query(
            StockMovement.product_id.label("product_id"),
            in_sum.label("in_sum"),
            out_sum.label("out_sum"),
        )
        .group_by(StockMovement.product_id)
        .subquery()
    )

    balance_expr = func.coalesce(movement_totals.c.in_sum, 0) - func.coalesce(
        movement_totals.c.out_sum, 0
    )
    low_stock_expr = case(
        (
            (Product.low_stock_enabled.is_(True)) & (balance_expr <= Product.min_stock),
            True,
        ),
        else_=False,
    )

    total = (
        db.query(Product)
        .outerjoin(movement_totals, movement_totals.c.product_id == Product.id)
        .filter(Product.is_active.is_(True))
        .filter(low_stock_expr.is_(True))
        .count()
    )
    return {"count": total}
