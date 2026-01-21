import pytest
from fastapi import HTTPException, Response
from starlette.requests import Request

from app.api.auth import login
from app.core.auth import get_current_user
from app.core.jwt import create_access_token
from app.schemas.auth import LoginRequest


def make_request_with_cookie(token: str | None) -> Request:
    headers = []
    if token:
        headers.append((b"cookie", f"access_token={token}".encode("utf-8")))
    scope = {
        "type": "http",
        "headers": headers,
        "method": "GET",
        "path": "/",
        "query_string": b"",
    }
    return Request(scope)


def test_get_current_user_requires_token(db_session):
    request = make_request_with_cookie(None)
    with pytest.raises(HTTPException) as exc_info:
        get_current_user(request=request, db=db_session)
    assert exc_info.value.status_code == 401


def test_login_and_current_user(db_session, admin_user):
    response = Response()
    payload = LoginRequest(email="admin@example.com", password="change-me")
    token_response = login(payload=payload, response=response, db=db_session)
    assert token_response.access_token
    assert "set-cookie" in response.headers

    token = create_access_token(str(admin_user.id))
    request = make_request_with_cookie(token)
    current_user = get_current_user(request=request, db=db_session)
    assert current_user.email == "admin@example.com"
