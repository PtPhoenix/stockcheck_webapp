import sys
from pathlib import Path

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.core.security import hash_password
from app.db.base import Base
from app.models.user import User
import app.models as models  # noqa: F401


engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)


@pytest.fixture(autouse=True)
def clean_db():
    db = TestingSessionLocal()
    try:
        for table in reversed(Base.metadata.sorted_tables):
            db.execute(table.delete())
        db.commit()
    finally:
        db.close()
    yield


@pytest.fixture()
def db_session():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture()
def admin_user(db_session):
    email = "admin@example.com"
    password = "change-me"
    user = db_session.query(User).filter(User.email == email).first()
    if not user:
        user = User(email=email, hashed_password=hash_password(password), is_active=True)
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
    return user
