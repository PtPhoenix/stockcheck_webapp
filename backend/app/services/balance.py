from sqlalchemy import case, func
from sqlalchemy.orm import Session

from app.models.stock_movement import StockMovement


def get_product_balance(db: Session, product_id: int) -> int:
    in_sum = func.coalesce(
        func.sum(case((StockMovement.movement_type == "IN", StockMovement.quantity), else_=0)),
        0,
    )
    out_sum = func.coalesce(
        func.sum(case((StockMovement.movement_type == "OUT", StockMovement.quantity), else_=0)),
        0,
    )
    balance = (
        db.query((in_sum - out_sum).label("balance"))
        .filter(StockMovement.product_id == product_id)
        .scalar()
    )
    return int(balance or 0)
