
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS linkedin_email text,
  ADD COLUMN IF NOT EXISTS linkedin_picture text,
  ADD COLUMN IF NOT EXISTS linkedin_headline text,
  ADD COLUMN IF NOT EXISTS linkedin_synced_at timestamptz;
