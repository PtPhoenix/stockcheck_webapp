import subprocess

from sqlalchemy import inspect

import app.models  # noqa: F401
from app.db.base import Base
from app.db.seed import ensure_admin_user
from app.db.session import SessionLocal, engine


def run_migrations() -> None:
    subprocess.run(["alembic", "-c", "alembic.ini", "upgrade", "head"], check=True)


def seed_admin() -> bool:
    db = SessionLocal()
    try:
        return ensure_admin_user(db)
    finally:
        db.close()


def ensure_tables() -> None:
    inspector = inspect(engine)
    if inspector.has_table("users"):
        return
    Base.metadata.create_all(bind=engine)


def main() -> None:
    run_migrations()
    ensure_tables()
    seeded = seed_admin()
    if seeded:
        print("Admin user created.")
    else:
        print("Admin user already exists or is disabled in settings.")


if __name__ == "__main__":
    main()
