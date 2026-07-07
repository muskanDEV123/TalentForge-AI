"""
database.py — Supabase connection via supabase-py client.

Tables created automatically on startup:
  - users        (managed by Supabase Auth — already exists)
  - analyses     (stores each resume analysis result)

We use the Supabase Python client for all DB operations.
"""

import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL: str = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_KEY: str = os.environ["SUPABASE_SERVICE_ROLE_KEY"]

# Service-role client — bypasses Row Level Security for server-side operations
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


async def create_tables():
    """
    Create the `analyses` table if it doesn't exist yet.
    Uses Supabase's rpc (raw SQL via a Postgres function) or the REST API.

    Run this SQL once in your Supabase dashboard → SQL Editor if you prefer
    manual setup instead of relying on this function:

    CREATE TABLE IF NOT EXISTS public.analyses (
        id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE,
        score       integer NOT NULL,
        matched_skills   text[]  NOT NULL DEFAULT '{}',
        missing_skills   text[]  NOT NULL DEFAULT '{}',
        recommendations  text[]  NOT NULL DEFAULT '{}',
        summary     text    NOT NULL DEFAULT '',
        resume_filename  text    NOT NULL DEFAULT '',
        created_at  timestamptz NOT NULL DEFAULT now()
    );

    ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Users can read own analyses"
      ON public.analyses FOR SELECT
      USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert own analyses"
      ON public.analyses FOR INSERT
      WITH CHECK (auth.uid() = user_id);
    """
    # We just verify the connection is alive; actual table creation is done
    # via the SQL above in the Supabase dashboard.
    try:
        supabase.table("analyses").select("id").limit(1).execute()
        print("✅ Supabase connection OK — analyses table found")
    except Exception as e:
        print(f"⚠️  Supabase startup check: {e}")
        print("   → Run the CREATE TABLE SQL in your Supabase dashboard.")
