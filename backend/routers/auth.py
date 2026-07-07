"""
routers/auth.py — Authentication endpoints using Supabase Auth.

POST /api/auth/signup   → create account
POST /api/auth/login    → sign in, returns JWT access_token
POST /api/auth/logout   → invalidate session
GET  /api/auth/me       → get current user info (protected)
"""

from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr
from database import supabase
from dependencies import get_current_user

router = APIRouter()


# ── Request / Response schemas ────────────────────────────────────────────────

class SignupRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def signup(body: SignupRequest):
    if len(body.password) < 8:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Password must be at least 8 characters.",
        )
    try:
        res = supabase.auth.sign_up({
            "email": body.email,
            "password": body.password,
            "options": {"data": {"full_name": body.full_name}},
        })
        if res.user is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Signup failed. This email may already be registered.",
            )
        return AuthResponse(
            access_token=res.session.access_token,
            user={
                "id": res.user.id,
                "email": res.user.email,
                "name": body.full_name,
            },
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e) or "Signup failed. Please try again.",
        )


@router.post("/login", response_model=AuthResponse)
async def login(body: LoginRequest):
    try:
        res = supabase.auth.sign_in_with_password({
            "email": body.email,
            "password": body.password,
        })
        if res.user is None or res.session is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
            )
        return AuthResponse(
            access_token=res.session.access_token,
            user={
                "id": res.user.id,
                "email": res.user.email,
                "name": res.user.user_metadata.get("full_name", ""),
            },
        )
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(user: dict = Depends(get_current_user)):
    try:
        supabase.auth.sign_out()
    except Exception:
        pass  # Always return 204 — client should discard the token


@router.get("/me")
async def me(user: dict = Depends(get_current_user)):
    return user
