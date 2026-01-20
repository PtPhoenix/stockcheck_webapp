from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.protected import router as protected_router
from app.core.auth import get_current_user
from app.db.deps import get_db
from app.models.product import Product
from app.models.stock_movement import StockMovement
from app.models.user import User
from app.schemas.movement import MovementCreate, MovementList, MovementOut


router = APIRouter(
    prefix="/movements",
    tags=["movements"],
    dependencies=protected_router.dependencies,
)


@router.post("", response_model=MovementOut, status_code=status.HTTP_201_CREATED)
def create_movement(
    payload: MovementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MovementOut:
    product = db.query(Product).filter(Product.id == payload.product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    movement = StockMovement(
        product_id=payload.product_id,
        movement_type=payload.movement_type,
        quantity=payload.quantity,
        note=payload.note,
        created_by=current_user.id,
    )
    db.add(movement)
    db.commit()
    db.refresh(movement)
    return movement


@router.get("", response_model=MovementList)
def list_movements(
    product_id: int | None = Query(None, ge=1),
    movement_type: str | None = Query(None, min_length=1),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
) -> MovementList:
    query = db.query(StockMovement).order_by(StockMovement.created_at.desc(), StockMovement.id.desc())
    if product_id is not None:
        query = query.filter(StockMovement.product_id == product_id)
    if movement_type:
        query = query.filter(StockMovement.movement_type == movement_type)

    total = query.count()
    items = query.offset(skip).limit(limit).all()
    return MovementList(items=items, total=total, skip=skip, limit=limit)
