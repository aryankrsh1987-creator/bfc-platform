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
