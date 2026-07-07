# Smart Resume Buddy — Full Stack (React + FastAPI + Supabase + Gemini)

An AI-powered ATS resume analyzer.

```
┌─────────────────────┐        ┌──────────────────────┐        ┌─────────────────┐
│  React (TanStack)   │  HTTP  │       FastAPI         │        │   Supabase      │
│  smart-resume-       │ ─────▶ │  smart-resume-backend │ ─────▶ │  (Auth + DB)    │
│  buddy-backend/      │        │                       │        └─────────────────┘
└─────────────────────┘        │                       │        ┌─────────────────┐
                                │                       │ ─────▶ │  Google Gemini   │
                                └──────────────────────┘        │  (AI analysis)   │
                                                                 └─────────────────┘
```

## Folders

| Folder | Stack | Purpose |
|---|---|---|
| `smart-resume-buddy-backend/` | React + Vite + TanStack Router | Frontend UI |
| `smart-resume-backend/` | FastAPI + Python | REST API, auth, AI calls |

---

## 1. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → paste and run `smart-resume-backend/supabase_setup.sql`
3. Go to **Settings → API** and copy:
   - `Project URL` → `SUPABASE_URL`
   - `service_role` key (NOT the anon key) → `SUPABASE_SERVICE_ROLE_KEY`
4. Go to **Authentication → Providers** and make sure **Email** is enabled
5. (Optional, for demos) Go to **Authentication → Settings** and disable "Confirm email" so new signups can log in immediately without verifying their inbox

## 2. Set up Gemini

1. Go to [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Create an API key → copy it for `GEMINI_API_KEY`

## 3. Run the backend (FastAPI)

```bash
cd smart-resume-backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env and fill in SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY

uvicorn main:app --reload --port 8000
```

Backend runs at **http://localhost:8000**
API docs (Swagger UI) at **http://localhost:8000/docs**

## 4. Run the frontend (React)

```bash
cd smart-resume-buddy-backend
bun install                      # or: npm install

cp .env.example .env
# VITE_API_URL=http://localhost:8000  (already the default)

bun dev                          # or: npm run dev
```

Frontend runs at **http://localhost:3000**

---

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | No | Create account |
| POST | `/api/auth/login` | No | Get JWT token |
| POST | `/api/auth/logout` | Yes | Invalidate session |
| GET | `/api/auth/me` | Yes | Current user info |
| POST | `/api/analyze/` | Yes | Upload resume PDF + JD → AI analysis |
| GET | `/api/history/` | Yes | List past analyses |
| GET | `/api/history/{id}` | Yes | Get one analysis |
| DELETE | `/api/history/{id}` | Yes | Delete an analysis |

---

## Deployment

**Backend** → Render, Railway, or Fly.io (any Python host). Set the three env vars in the dashboard.

**Frontend** → Vercel, Netlify, or Cloudflare Pages. Set `VITE_API_URL` to your deployed backend URL.

Remember to update CORS `allow_origins` in `smart-resume-backend/main.py` to your real frontend domain before going live.
