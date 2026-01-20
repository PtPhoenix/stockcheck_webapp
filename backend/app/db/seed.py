from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import hash_password
from app.models.user import User


def ensure_admin_user(db: Session) -> bool:
    if not settings.admin_email or not settings.admin_password:
        return False

    existing = db.query(User).filter(User.email == settings.admin_email).first()
    if existing:
        return False

    admin = User(
        email=settings.admin_email,
        hashed_password=hash_password(settings.admin_password),
        is_active=True,
    )
    db.add(admin)
    db.commit()
    return True
