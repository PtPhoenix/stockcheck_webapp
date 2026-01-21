import subprocess

from app.db.seed import ensure_admin_user
from app.db.session import SessionLocal


def run_migrations() -> None:
    subprocess.run(["alembic", "-c", "alembic.ini", "upgrade", "head"], check=True)


def seed_admin() -> bool:
    db = SessionLocal()
    try:
        return ensure_admin_user(db)
    finally:
        db.close()


def main() -> None:
    run_migrations()
    seeded = seed_admin()
    if seeded:
        print("Admin user created.")
    else:
        print("Admin user already exists or is disabled in settings.")


if __name__ == "__main__":
    main()
