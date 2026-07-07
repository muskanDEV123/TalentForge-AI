
"""
routers/analyze.py — Resume analysis endpoint.
 
POST /api/analyze/
    - Accepts: multipart/form-data with `resume` (PDF file) + `job_description` (text)
    - Extracts text from PDF server-side
    - Calls Google Gemini to produce structured ATS analysis
    - Saves result to Supabase `analyses` table
    - Returns: AnalysisResult JSON
"""
 
import io
import json
import logging
import os
import re
 
import google.generativeai as genai
from google.api_core.exceptions import NotFound, ResourceExhausted, ServiceUnavailable
import pypdf
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from pydantic import BaseModel
 
from database import supabase
from dependencies import get_current_user
 
router = APIRouter()
logger = logging.getLogger("analyze")
logging.basicConfig(level=logging.INFO)
 
# ── Gemini setup ──────────────────────────────────────────────────────────────
 
genai.configure(api_key=os.environ["GEMINI_API_KEY"])
model = model = genai.GenerativeModel("gemini-2.5-flash-lite")
 
 
# ── Response schema ───────────────────────────────────────────────────────────
 
class AnalysisResult(BaseModel):
    id: str | None = None
    score: int
    matched_skills: list[str]
    missing_skills: list[str]
    recommendations: list[str]
    summary: str
 
 
# ── PDF text extraction ───────────────────────────────────────────────────────
 
def extract_pdf_text(file_bytes: bytes) -> str:
    text = ""
 
    # Try pypdf first (fast)
    try:
        reader = pypdf.PdfReader(io.BytesIO(file_bytes))
        pages = [page.extract_text() or "" for page in reader.pages]
        text = "\n".join(pages).strip()
        logger.info(f"pypdf extracted {len(text)} chars")
    except Exception as e:
        logger.warning(f"pypdf failed: {e}")
        text = ""
 
    # Fallback to pdfplumber if pypdf got little/nothing (common with
    # PDFs exported from Canva, Google Docs, or certain Word exports)
    if len(text) < 50:
        try:
            import pdfplumber
            with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                pages = [p.extract_text() or "" for p in pdf.pages]
                fallback_text = "\n".join(pages).strip()
            logger.info(f"pdfplumber extracted {len(fallback_text)} chars")
            if len(fallback_text) > len(text):
                text = fallback_text
        except Exception as e:
            logger.warning(f"pdfplumber failed: {e}")
 
    if len(text) < 30:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                "Could not extract text from this PDF. "
                "It may be a scanned image or a flattened/image-based PDF. "
                "Try exporting it as a text-based PDF, or paste your resume text directly."
            ),
        )
 
    logger.info(f"Final extracted text preview: {text[:200]!r}")
    return text
 
 
# ── Gemini call ───────────────────────────────────────────────────────────────
 
SYSTEM_PROMPT = """You are an expert ATS (Applicant Tracking System) resume analyzer.
Compare the candidate's resume to the job description and respond with ONLY valid JSON.
No markdown, no code fences, no explanation — pure JSON only."""
 
# Common tech/soft skills we can match on when the AI call is unavailable
# (fallback only — the real analysis should come from Gemini).
_SKILL_KEYWORDS = [
    "python", "java", "javascript", "typescript", "sql", "nosql", "react", "angular",
    "vue", "node", "django", "flask", "fastapi", "spring", "docker", "kubernetes",
    "aws", "azure", "gcp", "ci/cd", "git", "agile", "scrum", "machine learning",
    "data analysis", "pandas", "numpy", "tensorflow", "pytorch", "excel", "tableau",
    "power bi", "project management", "communication", "leadership", "sql server",
    "rest api", "graphql", "html", "css", "linux", "bash", "terraform", "jenkins",
]
 
 
def keyword_fallback_analysis(resume_text: str, job_description: str) -> dict:
    """
    Lightweight, non-AI fallback used only when the Gemini API call itself
    fails (e.g. quota exhausted, model unavailable). Does a simple keyword
    overlap so the app still returns a usable result instead of a 502.
    """
    resume_lower = resume_text.lower()
    jd_lower = job_description.lower()
 
    jd_skills = [kw for kw in _SKILL_KEYWORDS if kw in jd_lower]
    matched = [kw for kw in jd_skills if kw in resume_lower]
    missing = [kw for kw in jd_skills if kw not in resume_lower]
 
    score = round((len(matched) / len(jd_skills)) * 100) if jd_skills else 50
 
    return {
        "score": score,
        "matched_skills": [s.title() for s in matched] or ["General experience detected"],
        "missing_skills": [s.title() for s in missing],
        "recommendations": [
            "AI analysis was temporarily unavailable, so this is a basic keyword-based estimate.",
            "Try again in a few minutes for a full AI-powered analysis.",
        ],
        "summary": "Basic keyword match completed (AI service was temporarily unavailable).",
    }
 
 
def analyze_with_gemini(resume_text: str, job_description: str) -> dict:
    prompt = f"""{SYSTEM_PROMPT}
 
Return JSON in exactly this shape:
{{
  "score": <integer 0-100, ATS match percentage>,
  "matched_skills": [<skills present in both resume and JD>],
  "missing_skills": [<important skills from JD missing in resume>],
  "recommendations": [<3-5 concise, actionable improvement strings>],
  "summary": "<one sentence overall assessment>"
}}
 
RESUME:
{resume_text[:6000]}
 
JOB DESCRIPTION:
{job_description[:3000]}"""
 
    response = model.generate_content(prompt)
    raw = response.text.strip()
    logger.info(f"Gemini raw response: {raw[:500]!r}")
 
    # Strip accidental markdown fences
    cleaned = re.sub(r"```(?:json)?", "", raw).strip().rstrip("`").strip()
 
    # If Gemini added any preamble/explanation text, extract just the {...} block
    if not cleaned.startswith("{"):
        match = re.search(r"\{.*\}", cleaned, re.DOTALL)
        if match:
            cleaned = match.group(0)
 
    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError as e:
        logger.error(f"JSON parse failed: {e}. Raw was: {raw!r}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI returned an unexpected response format. Please try again.",
        )
 
    # Validate required fields
    required = {"score", "matched_skills", "missing_skills", "recommendations", "summary"}
    if not required.issubset(data.keys()):
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI response was incomplete. Please try again.",
        )
 
    return data
 
 
# ── Route ─────────────────────────────────────────────────────────────────────
 
@router.post("/", response_model=AnalysisResult)
async def analyze_resume(
    resume: UploadFile = File(..., description="PDF resume file"),
    job_description: str = Form(..., min_length=50),
    user: dict = Depends(get_current_user),
):
    # 1. Validate file type
    filename = resume.filename or ""
    if not filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Only PDF files are supported.",
        )
 
    # 2. Read and extract text
    file_bytes = await resume.read()
    if len(file_bytes) > 10 * 1024 * 1024:  # 10 MB limit
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File too large. Maximum size is 10 MB.",
        )
 
    resume_text = extract_pdf_text(file_bytes)
    logger.info(f"Resume text length: {len(resume_text)}, JD length: {len(job_description)}")
 
    # 3. Call Gemini (falls back to a basic keyword analysis if the AI
    #    service itself is unavailable — e.g. quota exhausted, model
    #    retired — so the app still returns a usable result for the demo).
    try:
        ai_result = analyze_with_gemini(resume_text, job_description)
    except HTTPException:
        raise
    except (ResourceExhausted, NotFound, ServiceUnavailable) as e:
        logger.warning(f"Gemini unavailable ({type(e).__name__}), using keyword fallback: {e}")
        ai_result = keyword_fallback_analysis(resume_text, job_description)
    except Exception as e:
        logger.exception("Gemini call failed")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI analysis failed: {str(e)}",
        )
    # 4. Save to Supabase
    try:
        insert_res = (
            supabase.table("analyses")
            .insert({
                "user_id": user["id"],
                "score": ai_result["score"],
                "matched_skills": ai_result["matched_skills"],
                "missing_skills": ai_result["missing_skills"],
                "recommendations": ai_result["recommendations"],
                "summary": ai_result["summary"],
                "resume_filename": filename,
            })
            .execute()
        )
        row_id = insert_res.data[0]["id"] if insert_res.data else None
    except Exception:
        row_id = None  # Don't fail the request if saving fails
 
    return AnalysisResult(
        id=row_id,
        score=ai_result["score"],
        matched_skills=ai_result["matched_skills"],
        missing_skills=ai_result["missing_skills"],
        recommendations=ai_result["recommendations"],
        summary=ai_result["summary"],
    )
 