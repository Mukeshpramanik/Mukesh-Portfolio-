from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer, OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import verify_token
from app.models.models import Admin

# SlowAPI Limiter with graceful fallback
try:
    from slowapi import Limiter
    from slowapi.util import get_remote_address

    limiter = Limiter(key_func=get_remote_address)
    HAS_SLOWAPI = True
except ImportError:
    class DummyLimiter:
        def limit(self, *args, **kwargs):
            def decorator(func):
                return func
            return decorator

    limiter = DummyLimiter()  # type: ignore
    HAS_SLOWAPI = False

# Support both HTTPBearer and OAuth2PasswordBearer
bearer_scheme = HTTPBearer(auto_error=False)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/admin/login", auto_error=False)


def get_token_from_header(
    bearer: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    oauth_token: Optional[str] = Depends(oauth2_scheme),
) -> Optional[str]:
    """Extract Bearer token from either HTTPBearer Authorization header or OAuth2 form flow."""
    if bearer and bearer.credentials:
        return bearer.credentials
    if oauth_token:
        return oauth_token
    return None


def get_current_admin(
    db: Session = Depends(get_db),
    token: Optional[str] = Depends(get_token_from_header),
) -> Admin:
    """Validate JWT token and return the authenticated admin user or raise 401."""
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = verify_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials or token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )

    username: Optional[str] = payload.get("sub")
    if not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload is missing subject identity",
            headers={"WWW-Authenticate": "Bearer"},
        )

    admin = db.query(Admin).filter(Admin.username == username).first()
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin user specified in token no longer exists",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return admin


def require_admin(
    current_admin: Admin = Depends(get_current_admin),
) -> Admin:
    """Dependency that enforces admin authentication."""
    return current_admin
