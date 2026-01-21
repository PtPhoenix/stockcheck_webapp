from app.api.movements import create_movement
from app.api.products import create_product
from app.api.stock import stock_overview
from app.schemas.movement import MovementCreate
from app.schemas.product import ProductCreate


def test_balance_calculation(db_session, admin_user):
    product = create_product(
        payload=ProductCreate(
            name="Milk 1L",
            unit="pcs",
            min_stock=0,
            low_stock_enabled=True,
            is_active=True,
            initial_stock=0,
        ),
        db=db_session,
        current_user=admin_user,
    )

    create_movement(
        payload=MovementCreate(
            product_id=product.id,
            movement_type="IN",
            quantity=10,
            note="Restock",
        ),
        db=db_session,
        current_user=admin_user,
    )

    create_movement(
        payload=MovementCreate(
            product_id=product.id,
            movement_type="OUT",
            quantity=3,
            note="Sale",
        ),
        db=db_session,
        current_user=admin_user,
    )

    overview = stock_overview(
        search="milk",
        low_stock_only=False,
        active_only=True,
        sort_by="name",
        sort_dir="asc",
        low_stock_first=False,
        skip=0,
        limit=50,
        db=db_session,
    )
    assert overview.total == 1
    assert len(overview.items) == 1
    assert overview.items[0].balance == 7
