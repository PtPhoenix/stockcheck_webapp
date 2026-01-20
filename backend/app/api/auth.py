from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.core.security import verify_password
from app.core.jwt import create_access_token
from app.db.deps import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, TokenResponse, UserMe
from app.core.auth import get_current_user


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, response: Response, db: Session = Depends(get_db)) -> TokenResponse:
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Inactive user")

    token = create_access_token(str(user.id))
    response.set_cookie(
        "access_token",
        token,
        httponly=True,
        samesite="lax",
    )
    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserMe)
def me(current_user: User = Depends(get_current_user)) -> UserMe:
    return UserMe(id=current_user.id, email=current_user.email, is_active=current_user.is_active)


@router.post("/logout")
def logout(response: Response) -> dict:
    response.delete_cookie("access_token")
    return {"status": "ok"}
