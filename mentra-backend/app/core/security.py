from fastapi import Depends, Header, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from .config import settings


bearer_scheme = HTTPBearer(auto_error=False)


def require_bearer(creds: HTTPAuthorizationCredentials | None = Depends(bearer_scheme)):
    if creds is None or creds.scheme.lower() != "bearer" or creds.credentials != settings.API_BEARER_TOKEN:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail={"detail": "Unauthorized", "code": "unauthorized"})
    return True


def require_webhook(x_webhook_token: str | None = Header(default=None, alias="X-Webhook-Token")):
    if x_webhook_token != settings.WEBHOOK_TOKEN:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail={"detail": "Invalid webhook token", "code": "unauthorized"})
    return True


def api_error(detail: str, code: str, status_code: int = status.HTTP_400_BAD_REQUEST):
    raise HTTPException(status_code=status_code, detail={"detail": detail, "code": code})
