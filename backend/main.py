from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from routers import auth, analyze, history
from database import create_tables


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Run startup tasks before the app starts serving requests."""
    await create_tables()
    yield


app = FastAPI(
    title="Smart Resume Buddy API",
    description="ATS Resume Analyzer — FastAPI + Supabase + Gemini",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────────────
# Allow the React dev server (port 3000) and any deployed domain.
# In production replace "*" with your exact frontend URL.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router,    prefix="/api/auth",    tags=["Auth"])
app.include_router(analyze.router, prefix="/api/analyze", tags=["Analyze"])
app.include_router(history.router, prefix="/api/history", tags=["History"])


@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "message": "Smart Resume Buddy API is running"}
