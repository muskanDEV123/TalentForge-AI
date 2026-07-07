-- ─────────────────────────────────────────────────────────────────────────────
-- Smart Resume Buddy — Supabase Database Setup
-- Run this once in your Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- Table to store every resume analysis result
create table if not exists public.analyses (
    id               uuid primary key default gen_random_uuid(),
    user_id          uuid references auth.users(id) on delete cascade,
    score            integer not null,
    matched_skills   text[]  not null default '{}',
    missing_skills   text[]  not null default '{}',
    recommendations  text[]  not null default '{}',
    summary          text    not null default '',
    resume_filename  text    not null default '',
    created_at       timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.analyses enable row level security;

-- Users can only see their own analyses
create policy "Users can read own analyses"
    on public.analyses for select
    using (auth.uid() = user_id);

-- Users can only insert analyses for themselves
create policy "Users can insert own analyses"
    on public.analyses for insert
    with check (auth.uid() = user_id);

-- Users can only delete their own analyses
create policy "Users can delete own analyses"
    on public.analyses for delete
    using (auth.uid() = user_id);

-- Index for fast history lookups, newest first
create index if not exists analyses_user_created_idx
    on public.analyses (user_id, created_at desc);
