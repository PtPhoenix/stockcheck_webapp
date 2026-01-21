import csv
import io
from datetime import datetime

from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy import case, func
from sqlalchemy.orm import Session

from app.api.protected import router as protected_router
from app.db.deps import get_db
from app.models.product import Product
from app.models.stock_movement import StockMovement


router = APIRouter(
    prefix="/export",
    tags=["export"],
    dependencies=protected_router.dependencies,
)


def build_csv_response(filename: str, headers: list[str], rows: list[tuple]) -> Response:
    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(headers)
    writer.writerows(rows)
    content = buffer.getvalue().encode("utf-8-sig")
    return Response(
        content=content,
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/products.csv")
def export_products(db: Session = Depends(get_db)) -> Response:
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

    rows = (
        db.query(
            Product.id,
            Product.name,
            Product.unit,
            Product.min_stock,
            Product.low_stock_enabled,
            Product.is_active,
            Product.created_at,
            balance_expr.label("balance"),
        )
        .outerjoin(movement_totals, movement_totals.c.product_id == Product.id)
        .order_by(Product.id)
        .all()
    )

    headers = [
        "id",
        "name",
        "unit",
        "min_stock",
        "low_stock_enabled",
        "is_active",
        "created_at",
        "balance",
    ]
    data_rows = [
        (
            row.id,
            row.name,
            row.unit,
            row.min_stock,
            row.low_stock_enabled,
            row.is_active,
            row.created_at.isoformat() if row.created_at else "",
            int(row.balance or 0),
        )
        for row in rows
    ]
    return build_csv_response("products.csv", headers, data_rows)


@router.get("/movements.csv")
def export_movements(
    start_at: datetime | None = Query(None),
    end_at: datetime | None = Query(None),
    db: Session = Depends(get_db),
) -> Response:
    query = (
        db.query(
            StockMovement.id,
            StockMovement.product_id,
            Product.name.label("product_name"),
            Product.unit.label("unit"),
            StockMovement.movement_type,
            StockMovement.quantity,
            StockMovement.note,
            StockMovement.created_by,
            StockMovement.created_at,
        )
        .join(Product, Product.id == StockMovement.product_id)
        .order_by(StockMovement.created_at.desc(), StockMovement.id.desc())
    )
    if start_at:
        query = query.filter(StockMovement.created_at >= start_at)
    if end_at:
        query = query.filter(StockMovement.created_at <= end_at)

    rows = query.all()
    headers = [
        "id",
        "product_id",
        "product_name",
        "unit",
        "movement_type",
        "quantity",
        "note",
        "created_by",
        "created_at",
    ]
    data_rows = [
        (
            row.id,
            row.product_id,
            row.product_name,
            row.unit,
            row.movement_type,
            row.quantity,
            row.note or "",
            row.created_by,
            row.created_at.isoformat() if row.created_at else "",
        )
        for row in rows
    ]
    return build_csv_response("movements.csv", headers, data_rows)


@router.get("/stock_overview.csv")
def export_stock_overview(
    search: str | None = Query(None, min_length=1),
    low_stock_only: bool = False,
    active_only: bool = True,
    sort_by: str = Query("name", pattern="^(name|balance)$"),
    sort_dir: str = Query("asc", pattern="^(asc|desc)$"),
    low_stock_first: bool = False,
    db: Session = Depends(get_db),
) -> Response:
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

    rows = query.all()
    headers = [
        "id",
        "name",
        "unit",
        "min_stock",
        "low_stock_enabled",
        "is_active",
        "created_at",
        "balance",
        "low_stock",
    ]
    data_rows = [
        (
            row.id,
            row.name,
            row.unit,
            row.min_stock,
            row.low_stock_enabled,
            row.is_active,
            row.created_at.isoformat() if row.created_at else "",
            int(row.balance or 0),
            bool(row.low_stock),
        )
        for row in rows
    ]
    return build_csv_response("stock_overview.csv", headers, data_rows)
