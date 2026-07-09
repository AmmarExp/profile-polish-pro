
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS linkedin_access_token TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_refresh_token TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS linkedin_name TEXT;

CREATE TABLE IF NOT EXISTS public.linkedin_oauth_states (
  state TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.linkedin_oauth_states TO authenticated;
GRANT ALL ON public.linkedin_oauth_states TO service_role;
ALTER TABLE public.linkedin_oauth_states ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users manage own oauth states" ON public.linkedin_oauth_states
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
