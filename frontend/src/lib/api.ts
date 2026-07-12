/**
 * api.ts — Typed fetch wrappers for the FastAPI backend.
 *
 * Base URL is read from VITE_API_URL env var.
 * Falls back to http://localhost:8000 for local development.
 *
 * Set VITE_API_URL in your .env file:
 *   VITE_API_URL=http://localhost:8000
 */

const BASE = import.meta.env["VITE_API_URL"] ?? "http://localhost:8000";

// ── Token storage (localStorage) ─────────────────────────────────────────────

export const token = {
  get: (): string | null =>
    typeof window === "undefined" ? null : localStorage.getItem("ats_token"),
  set: (t: string) => {
    if (typeof window !== "undefined") localStorage.setItem("ats_token", t);
  },
  clear: () => {
    if (typeof window !== "undefined") localStorage.removeItem("ats_token");
  },
};

// ── Generic fetch helper ──────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  auth = true,
): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (auth) {
    const t = token.get();
    if (t) headers["Authorization"] = `Bearer ${t}`;
  }

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;

    try {
      const err = await res.json();
      message = err.detail ?? message;
    } catch {}

    if (res.status === 401) {
      message = "Your session has expired. Please log in again.";
    }

    const error = new Error(message) as Error & { status?: number };
    error.status = res.status;
    throw error;
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

export async function apiSignup(full_name: string, email: string, password: string): Promise<AuthResponse> {
  const res = await apiFetch<AuthResponse>("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ full_name, email, password }),
  }, false);
  token.set(res.access_token);
  return res;
}

export async function apiLogin(email: string, password: string): Promise<AuthResponse> {
  const res = await apiFetch<AuthResponse>("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  }, false);
  token.set(res.access_token);
  return res;
}

export async function apiLogout(): Promise<void> {
  try {
    await apiFetch<void>("/api/auth/logout", { method: "POST" });
  } finally {
    token.clear();
  }
}

export async function apiMe(): Promise<AuthUser> {
  return apiFetch<AuthUser>("/api/auth/me");
}

// ── Analysis ──────────────────────────────────────────────────────────────────

export interface AnalysisResult {
  id: string | null;
  score: number;
  matched_skills: string[];
  missing_skills: string[];
  recommendations: string[];
  summary: string;
}

export async function apiAnalyze(
  resumeFile: File,
  jobDescription: string,
): Promise<AnalysisResult> {
  const form = new FormData();
  form.append("resume", resumeFile);
  form.append("job_description", jobDescription);

  return apiFetch<AnalysisResult>("/api/analyze/", {
    method: "POST",
    body: form,
    // Do NOT set Content-Type — browser sets it with the correct boundary
  });
}

// ── History ───────────────────────────────────────────────────────────────────

export interface HistoryItem {
  id: string;
  score: number;
  summary: string;
  resume_filename: string;
  created_at: string;
  matched_skills: string[];
  missing_skills: string[];
}

export async function apiHistory(): Promise<HistoryItem[]> {
  return apiFetch<HistoryItem[]>("/api/history/");
}

export async function apiDeleteAnalysis(id: string): Promise<void> {
  return apiFetch<void>(`/api/history/${id}`, { method: "DELETE" });
}