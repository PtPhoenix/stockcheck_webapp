from app.api.products import create_product
from app.api.stock import low_stock_count, stock_overview
from app.schemas.product import ProductCreate


def test_low_stock_detection(db_session, admin_user):
    create_product(
        payload=ProductCreate(
            name="Sugar",
            unit="kg",
            min_stock=5,
            low_stock_enabled=True,
            is_active=True,
            initial_stock=3,
        ),
        db=db_session,
        current_user=admin_user,
    )

    overview = stock_overview(
        search=None,
        low_stock_only=True,
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
    assert overview.items[0].low_stock is True

    count = low_stock_count(db=db_session)
    assert count["count"] == 1


def test_stock_overview_search(db_session, admin_user):
    create_product(
        payload=ProductCreate(
            name="Sea Salt",
            unit="kg",
            min_stock=0,
            low_stock_enabled=True,
            is_active=True,
            initial_stock=0,
        ),
        db=db_session,
        current_user=admin_user,
    )
    create_product(
        payload=ProductCreate(
            name="Brown Sugar",
            unit="kg",
            min_stock=0,
            low_stock_enabled=True,
            is_active=True,
            initial_stock=0,
        ),
        db=db_session,
        current_user=admin_user,
    )

    overview = stock_overview(
        search="SALT",
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
    assert overview.items[0].name == "Sea Salt"
