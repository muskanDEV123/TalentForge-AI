"""
routers/history.py — Analysis history endpoints.

GET  /api/history/          → list all past analyses for the logged-in user
GET  /api/history/{id}      → get a single analysis by ID
DELETE /api/history/{id}    → delete an analysis
"""

from fastapi import APIRouter, Depends, HTTPException, status
from database import supabase
from dependencies import get_current_user

router = APIRouter()


@router.get("/")
async def list_analyses(user: dict = Depends(get_current_user)):
    """Return all analyses for the current user, newest first."""
    try:
        res = (
            supabase.table("analyses")
            .select("id, score, summary, resume_filename, created_at, matched_skills, missing_skills")
            .eq("user_id", user["id"])
            .order("created_at", desc=True)
            .execute()
        )
        return res.data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch history: {str(e)}",
        )


@router.get("/{analysis_id}")
async def get_analysis(analysis_id: str, user: dict = Depends(get_current_user)):
    """Return a single analysis (only if it belongs to the current user)."""
    try:
        res = (
            supabase.table("analyses")
            .select("*")
            .eq("id", analysis_id)
            .eq("user_id", user["id"])
            .single()
            .execute()
        )
        if not res.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found.")
        return res.data
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found.")


@router.delete("/{analysis_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_analysis(analysis_id: str, user: dict = Depends(get_current_user)):
    """Delete an analysis (only if it belongs to the current user)."""
    try:
        supabase.table("analyses") \
            .delete() \
            .eq("id", analysis_id) \
            .eq("user_id", user["id"]) \
            .execute()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Delete failed: {str(e)}",
        )
