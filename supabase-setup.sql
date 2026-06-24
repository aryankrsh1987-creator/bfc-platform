-- ============================================================
--  Blox Fruits Competitive — Database Setup
--  Copy and paste this entire file into Supabase SQL Editor
--  (Dashboard → SQL Editor → New Query → Paste → Run)
-- ============================================================

-- 1. PLAYERS TABLE (stores user profiles)
CREATE TABLE IF NOT EXISTS players (
  email TEXT PRIMARY KEY,
  username TEXT,
  display_name TEXT,
  avatar_url TEXT,
  status TEXT,
  region TEXT,
  device TEXT
);

-- 2. CREWS TABLE (stores crew info & stats)
CREATE TABLE IF NOT EXISTS crews (
  id SERIAL PRIMARY KEY,
  owner_email TEXT,
  owner_username TEXT,
  crew_name TEXT,
  crew_tag TEXT,
  region TEXT,
  discord TEXT,
  roblox TEXT,
  pub_won INTEGER DEFAULT 0,
  pub_lost INTEGER DEFAULT 0,
  org_won INTEGER DEFAULT 0,
  org_lost INTEGER DEFAULT 0
);

-- 3. CREW MEMBERS (who belongs to which crew)
CREATE TABLE IF NOT EXISTS crew_members (
  id SERIAL PRIMARY KEY,
  crew_id INTEGER REFERENCES crews(id),
  crew_name TEXT,
  member_email TEXT,
  member_username TEXT
);

-- 4. CREW REQUESTS (join applications)
CREATE TABLE IF NOT EXISTS crew_requests (
  id SERIAL PRIMARY KEY,
  crew_id INTEGER REFERENCES crews(id),
  crew_name TEXT,
  applicant_email TEXT,
  applicant_username TEXT,
  applicant_region TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PLAYER RANKINGS (leaderboard data)
CREATE TABLE IF NOT EXISTS player_rankings (
  id SERIAL PRIMARY KEY,
  ranks INTEGER,
  mode TEXT,
  username TEXT,
  player_1 TEXT,
  player_2 TEXT,
  region TEXT,
  country_flag TEXT,
  discord TEXT,
  youtube TEXT
);

-- 6. WAR SUBMISSIONS (verified war logs)
CREATE TABLE IF NOT EXISTS war_submissions (
  id SERIAL PRIMARY KEY,
  crew_a TEXT,
  crew_b TEXT,
  winner TEXT,
  score TEXT,
  region TEXT,
  format TEXT,
  proof_images TEXT[],
  screenshot_count INTEGER,
  submitted_by TEXT,
  status TEXT DEFAULT 'pending'
);

-- 7. NOTIFICATIONS (in-app alerts)
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_email TEXT,
  title TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. WAR CHATS (private war discussion threads)
CREATE TABLE IF NOT EXISTS war_chats (
  id SERIAL PRIMARY KEY,
  requester_email TEXT,
  opponent_email TEXT
);

-- 9. STAFFS (admin access list)
CREATE TABLE IF NOT EXISTS staffs (
  email TEXT PRIMARY KEY
);

-- ============================================================
--  ACCESS CONTROL
-- ============================================================

-- Helper used by policies. SECURITY DEFINER lets this function check the
-- private staffs table without exposing the staff list to browser clients.
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.staffs
    WHERE email = (SELECT auth.jwt() ->> 'email')
  );
$$;

REVOKE ALL ON FUNCTION public.is_staff() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_staff() TO authenticated;

-- Public directory views deliberately omit private email addresses. The
-- underlying tables remain available only through the policies below.
CREATE OR REPLACE VIEW public.player_public_profiles
WITH (security_barrier = true)
AS
SELECT username, display_name, avatar_url, status, region, device
FROM public.players;

CREATE OR REPLACE VIEW public.crew_directory
WITH (security_barrier = true)
AS
SELECT
  id,
  CASE
    WHEN owner_email = (SELECT auth.jwt() ->> 'email') THEN owner_email
    ELSE NULL
  END AS owner_email,
  owner_username,
  crew_name,
  crew_tag,
  region,
  discord,
  roblox,
  pub_won,
  pub_lost,
  org_won,
  org_lost
FROM public.crews;

ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crew_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crew_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.war_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.war_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staffs ENABLE ROW LEVEL SECURITY;

-- Players: users can manage only their own profile. Public profile reads use
-- player_public_profiles so email addresses never leave the base table.
DROP POLICY IF EXISTS "players_select_own" ON public.players;
CREATE POLICY "players_select_own"
ON public.players FOR SELECT TO authenticated
USING (email = (SELECT auth.jwt() ->> 'email') OR public.is_staff());

DROP POLICY IF EXISTS "players_insert_own" ON public.players;
CREATE POLICY "players_insert_own"
ON public.players FOR INSERT TO authenticated
WITH CHECK (email = (SELECT auth.jwt() ->> 'email'));

DROP POLICY IF EXISTS "players_update_own" ON public.players;
CREATE POLICY "players_update_own"
ON public.players FOR UPDATE TO authenticated
USING (email = (SELECT auth.jwt() ->> 'email'))
WITH CHECK (email = (SELECT auth.jwt() ->> 'email'));

-- Crews: public reads use crew_directory; owners control their own crew and
-- staff members may moderate all crews.
DROP POLICY IF EXISTS "crews_select_owner_or_staff" ON public.crews;
CREATE POLICY "crews_select_owner_or_staff"
ON public.crews FOR SELECT TO authenticated
USING (owner_email = (SELECT auth.jwt() ->> 'email') OR public.is_staff());

DROP POLICY IF EXISTS "crews_insert_owner" ON public.crews;
CREATE POLICY "crews_insert_owner"
ON public.crews FOR INSERT TO authenticated
WITH CHECK (owner_email = (SELECT auth.jwt() ->> 'email'));

DROP POLICY IF EXISTS "crews_update_owner_or_staff" ON public.crews;
CREATE POLICY "crews_update_owner_or_staff"
ON public.crews FOR UPDATE TO authenticated
USING (owner_email = (SELECT auth.jwt() ->> 'email') OR public.is_staff())
WITH CHECK (owner_email = (SELECT auth.jwt() ->> 'email') OR public.is_staff());

DROP POLICY IF EXISTS "crews_delete_owner_or_staff" ON public.crews;
CREATE POLICY "crews_delete_owner_or_staff"
ON public.crews FOR DELETE TO authenticated
USING (owner_email = (SELECT auth.jwt() ->> 'email') OR public.is_staff());

-- Applications: applicants can create/read their own request; the matching
-- crew owner (or staff) can review it.
DROP POLICY IF EXISTS "crew_requests_select_participant" ON public.crew_requests;
CREATE POLICY "crew_requests_select_participant"
ON public.crew_requests FOR SELECT TO authenticated
USING (
  applicant_email = (SELECT auth.jwt() ->> 'email')
  OR public.is_staff()
  OR EXISTS (
    SELECT 1 FROM public.crews
    WHERE crews.id = crew_requests.crew_id
      AND crews.owner_email = (SELECT auth.jwt() ->> 'email')
  )
);

DROP POLICY IF EXISTS "crew_requests_insert_own" ON public.crew_requests;
CREATE POLICY "crew_requests_insert_own"
ON public.crew_requests FOR INSERT TO authenticated
WITH CHECK (
  applicant_email = (SELECT auth.jwt() ->> 'email')
  AND status = 'pending'
);

DROP POLICY IF EXISTS "crew_requests_update_owner_or_staff" ON public.crew_requests;
CREATE POLICY "crew_requests_update_owner_or_staff"
ON public.crew_requests FOR UPDATE TO authenticated
USING (
  public.is_staff()
  OR EXISTS (
    SELECT 1 FROM public.crews
    WHERE crews.id = crew_requests.crew_id
      AND crews.owner_email = (SELECT auth.jwt() ->> 'email')
  )
)
WITH CHECK (
  public.is_staff()
  OR EXISTS (
    SELECT 1 FROM public.crews
    WHERE crews.id = crew_requests.crew_id
      AND crews.owner_email = (SELECT auth.jwt() ->> 'email')
  )
);

DROP POLICY IF EXISTS "crew_requests_delete_participant" ON public.crew_requests;
CREATE POLICY "crew_requests_delete_participant"
ON public.crew_requests FOR DELETE TO authenticated
USING (
  applicant_email = (SELECT auth.jwt() ->> 'email')
  OR public.is_staff()
  OR EXISTS (
    SELECT 1 FROM public.crews
    WHERE crews.id = crew_requests.crew_id
      AND crews.owner_email = (SELECT auth.jwt() ->> 'email')
  )
);

-- Memberships: members can see their own membership, while the relevant crew
-- owner can add/remove members.
DROP POLICY IF EXISTS "crew_members_select_participant" ON public.crew_members;
CREATE POLICY "crew_members_select_participant"
ON public.crew_members FOR SELECT TO authenticated
USING (
  member_email = (SELECT auth.jwt() ->> 'email')
  OR public.is_staff()
  OR EXISTS (
    SELECT 1 FROM public.crews
    WHERE crews.id = crew_members.crew_id
      AND crews.owner_email = (SELECT auth.jwt() ->> 'email')
  )
);

DROP POLICY IF EXISTS "crew_members_insert_owner_or_staff" ON public.crew_members;
CREATE POLICY "crew_members_insert_owner_or_staff"
ON public.crew_members FOR INSERT TO authenticated
WITH CHECK (
  public.is_staff()
  OR EXISTS (
    SELECT 1 FROM public.crews
    WHERE crews.id = crew_members.crew_id
      AND crews.owner_email = (SELECT auth.jwt() ->> 'email')
  )
);

DROP POLICY IF EXISTS "crew_members_delete_participant" ON public.crew_members;
CREATE POLICY "crew_members_delete_participant"
ON public.crew_members FOR DELETE TO authenticated
USING (
  member_email = (SELECT auth.jwt() ->> 'email')
  OR public.is_staff()
  OR EXISTS (
    SELECT 1 FROM public.crews
    WHERE crews.id = crew_members.crew_id
      AND crews.owner_email = (SELECT auth.jwt() ->> 'email')
  )
);

-- Rankings are public to read, but only staff can change them.
DROP POLICY IF EXISTS "rankings_public_read" ON public.player_rankings;
CREATE POLICY "rankings_public_read"
ON public.player_rankings FOR SELECT TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "rankings_staff_insert" ON public.player_rankings;
CREATE POLICY "rankings_staff_insert"
ON public.player_rankings FOR INSERT TO authenticated
WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "rankings_staff_update" ON public.player_rankings;
CREATE POLICY "rankings_staff_update"
ON public.player_rankings FOR UPDATE TO authenticated
USING (public.is_staff())
WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "rankings_staff_delete" ON public.player_rankings;
CREATE POLICY "rankings_staff_delete"
ON public.player_rankings FOR DELETE TO authenticated
USING (public.is_staff());

-- War submissions are private to the submitter until staff review them.
DROP POLICY IF EXISTS "war_submissions_select_owner_or_staff" ON public.war_submissions;
CREATE POLICY "war_submissions_select_owner_or_staff"
ON public.war_submissions FOR SELECT TO authenticated
USING (submitted_by = (SELECT auth.jwt() ->> 'email') OR public.is_staff());

DROP POLICY IF EXISTS "war_submissions_insert_own" ON public.war_submissions;
CREATE POLICY "war_submissions_insert_own"
ON public.war_submissions FOR INSERT TO authenticated
WITH CHECK (
  submitted_by = (SELECT auth.jwt() ->> 'email')
  AND status = 'pending'
);

DROP POLICY IF EXISTS "war_submissions_staff_update" ON public.war_submissions;
CREATE POLICY "war_submissions_staff_update"
ON public.war_submissions FOR UPDATE TO authenticated
USING (public.is_staff())
WITH CHECK (public.is_staff());

-- Notifications are visible/deletable only by their recipient or staff.
DROP POLICY IF EXISTS "notifications_select_recipient" ON public.notifications;
CREATE POLICY "notifications_select_recipient"
ON public.notifications FOR SELECT TO authenticated
USING (user_email = (SELECT auth.jwt() ->> 'email') OR public.is_staff());

DROP POLICY IF EXISTS "notifications_insert_staff" ON public.notifications;
CREATE POLICY "notifications_insert_staff"
ON public.notifications FOR INSERT TO authenticated
WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "notifications_delete_recipient" ON public.notifications;
CREATE POLICY "notifications_delete_recipient"
ON public.notifications FOR DELETE TO authenticated
USING (user_email = (SELECT auth.jwt() ->> 'email') OR public.is_staff());

-- War chats can be read only by the two participants or staff. Creation is
-- handled atomically by respond_to_war_notification below.
DROP POLICY IF EXISTS "war_chats_select_participant" ON public.war_chats;
CREATE POLICY "war_chats_select_participant"
ON public.war_chats FOR SELECT TO authenticated
USING (
  requester_email = (SELECT auth.jwt() ->> 'email')
  OR opponent_email = (SELECT auth.jwt() ->> 'email')
  OR public.is_staff()
);

-- The staff list itself is private; a user may only verify their own row.
DROP POLICY IF EXISTS "staffs_select_self" ON public.staffs;
CREATE POLICY "staffs_select_self"
ON public.staffs FOR SELECT TO authenticated
USING (email = (SELECT auth.jwt() ->> 'email'));

-- Safely accept or dodge a war notification without granting browser clients
-- permission to create chats or notifications for arbitrary users.
CREATE OR REPLACE FUNCTION public.respond_to_war_notification(
  notification_id INTEGER,
  accepted BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_email TEXT := (SELECT auth.jwt() ->> 'email');
  incoming public.notifications%ROWTYPE;
  requester TEXT;
BEGIN
  IF current_email IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT * INTO incoming
  FROM public.notifications
  WHERE id = notification_id
    AND user_email = current_email
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Notification not found';
  END IF;

  requester := substring(incoming.message FROM '\(([^)]+)\)');

  IF requester IS NULL OR requester = '' THEN
    RAISE EXCEPTION 'This notification is not a war request';
  END IF;

  IF accepted THEN
    INSERT INTO public.war_chats (requester_email, opponent_email)
    VALUES (requester, current_email);

    INSERT INTO public.notifications (user_email, title, message)
    VALUES (
      requester,
      'War Accepted',
      'Your war request was accepted.'
    );
  ELSE
    INSERT INTO public.notifications (user_email, title, message)
    VALUES (
      requester,
      'War Dodged',
      'Your war request was dodged.'
    );
  END IF;

  DELETE FROM public.notifications WHERE id = notification_id;
END;
$$;

REVOKE ALL ON FUNCTION public.respond_to_war_notification(INTEGER, BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.respond_to_war_notification(INTEGER, BOOLEAN) TO authenticated;

-- Keep direct table access narrow even if default Supabase grants change.
REVOKE ALL ON TABLE
  public.players,
  public.crews,
  public.crew_members,
  public.crew_requests,
  public.war_submissions,
  public.notifications,
  public.war_chats,
  public.staffs
FROM anon;

GRANT SELECT ON public.player_rankings TO anon;
GRANT SELECT ON public.player_public_profiles, public.crew_directory TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
  public.players,
  public.crews,
  public.crew_members,
  public.crew_requests,
  public.player_rankings,
  public.war_submissions,
  public.notifications,
  public.war_chats
TO authenticated;

GRANT SELECT ON public.staffs TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Storage uploads are namespaced by auth.uid(); matching application code
-- writes avatars and proof images into these user-owned folders.
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('avatars', 'avatars', true),
  ('war-proofs', 'war-proofs', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

DROP POLICY IF EXISTS "users_upload_own_avatars" ON storage.objects;
CREATE POLICY "users_upload_own_avatars"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = (SELECT auth.uid()::TEXT)
);

DROP POLICY IF EXISTS "users_upload_own_war_proofs" ON storage.objects;
CREATE POLICY "users_upload_own_war_proofs"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'war-proofs'
  AND (storage.foldername(name))[1] = (SELECT auth.uid()::TEXT)
);
