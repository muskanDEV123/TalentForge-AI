# Smart Resume Buddy — Deployment Guide

A full-stack AI-powered ATS resume analyzer built with **TanStack Start** (React SSR) and **Anthropic Claude**.

---

## Architecture

```
Frontend  →  TanStack Start (React 19, SSR)
Backend   →  TanStack Server Functions (run on the same Node/Cloudflare Worker process)
AI        →  Anthropic Claude (claude-sonnet-4-6)
Auth      →  HTTP-only session cookie + in-memory store (swap for a DB in production)
PDF       →  pdf-parse (server-side text extraction)
Deploy    →  Cloudflare Workers (via Nitro) or any Node 18+ host
```

---

## Quick Start (local dev)

```bash
# 1. Install dependencies
bun install          # or: npm install

# 2. Set up environment
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# 3. Run dev server
bun dev              # or: npm run dev
# → http://localhost:3000
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | ✅ Yes | From https://console.anthropic.com/ |
| `NODE_ENV` | No | Set to `production` for prod builds |

---

## Deploy to Cloudflare Workers

This project uses `@lovable.dev/vite-tanstack-config` which includes Nitro with the Cloudflare preset.

```bash
# 1. Build
bun run build

# 2. Deploy with Wrangler
npx wrangler deploy

# 3. Set your secret key
npx wrangler secret put ANTHROPIC_API_KEY
# Paste your key when prompted
```

---

## Deploy to a Node.js Server (VPS / Railway / Render)

```bash
# 1. Build
bun run build

# 2. Set env
export ANTHROPIC_API_KEY=your_key_here
export NODE_ENV=production

# 3. Start
node .output/server/index.mjs
```

For Railway / Render: add `ANTHROPIC_API_KEY` in the dashboard's environment variables section.

---

## Production Checklist

- [ ] `ANTHROPIC_API_KEY` is set in your deployment environment
- [ ] `NODE_ENV=production` is set
- [ ] Replace in-memory auth store (`src/lib/auth.ts`) with a real database (Postgres, SQLite, etc.) for persistence across deploys/restarts
- [ ] Add rate-limiting middleware on `/api/*` routes to protect your Anthropic API key
- [ ] Configure HTTPS (Cloudflare Workers handles this automatically)

---

## File Structure

```
src/
├── lib/
│   ├── analyze.ts       ← AI analysis server function (calls Claude)
│   ├── auth.ts          ← Login / signup / session server functions
│   ├── pdf-extract.ts   ← PDF text extraction server function
│   ├── error-capture.ts
│   ├── error-page.ts
│   └── utils.ts
├── routes/
│   ├── __root.tsx       ← HTML shell, QueryClient provider
│   ├── index.tsx        ← Landing page
│   ├── login.tsx        ← Login (calls auth.ts)
│   ├── signup.tsx       ← Signup (calls auth.ts)
│   ├── dashboard.tsx    ← Upload resume + paste JD → calls analyze.ts
│   ├── results.tsx      ← Renders AI analysis results
│   ├── analyze.tsx      ← Public analyze page (no auth required)
│   └── about.tsx        ← About page
├── components/
│   └── Shell.tsx        ← Nav bars, Footer, Icon
├── server.ts            ← SSR error wrapper
└── start.ts             ← TanStack Start entry with middleware
```

---

## How the AI Analysis Works

1. User uploads a PDF resume → `pdf-extract.ts` extracts text server-side
2. User pastes a job description
3. `analyze.ts` sends both to Claude with a structured prompt
4. Claude returns JSON: `{ score, matchedSkills, missingSkills, recommendations, summary }`
5. Results are stored in `sessionStorage` and displayed on `/results`
