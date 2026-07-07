"""
dependencies.py — Reusable FastAPI dependencies.

get_current_user:  Reads the Bearer token from the Authorization header,
                   verifies it with Supabase Auth, and returns the user dict.
                   Inject into any protected route with:
                       user = Depends(get_current_user)
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from database import supabase

bearer_scheme = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> dict:
    token = credentials.credentials
    try:
        response = supabase.auth.get_user(token)
        if response.user is None:
            raise ValueError("No user in token")
        return {
            "id": response.user.id,
            "email": response.user.email,
            "name": response.user.user_metadata.get("full_name", ""),
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token. Please log in again.",
        )
