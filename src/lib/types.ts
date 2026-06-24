export interface Player {
  email: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  status: string | null;
  region: string | null;
  device: string | null;
}

export interface Crew {
  id: number;
  owner_email: string | null;
  owner_username: string;
  crew_name: string;
  crew_tag: string;
  region: string;
  discord: string;
  roblox: string;
  pub_won: number;
  pub_lost: number;
  org_won: number;
  org_lost: number;
}

export interface CrewMember {
  id: number;
  crew_id: number;
  crew_name: string;
  member_email: string;
  member_username: string;
}

export interface CrewRequest {
  id: number;
  crew_id: number;
  crew_name: string;
  applicant_email: string;
  applicant_username: string;
  applicant_region: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
}

export interface PlayerRanking {
  id: number;
  ranks: number;
  mode: "1v1" | "2v2";
  username: string | null;
  player_1: string | null;
  player_2: string | null;
  region: string;
  country_flag: string | null;
  discord: string | null;
  youtube: string | null;
}

export interface WarSubmission {
  id: number;
  crew_a: string;
  crew_b: string;
  winner: string;
  score: string;
  region: string;
  format: string;
  proof_images: string[];
  screenshot_count: number;
  submitted_by: string;
  status: "pending" | "approved" | "rejected";
}

export interface Notification {
  id: number;
  user_email: string;
  title: string;
  message: string;
  created_at: string;
}

export interface WarChat {
  id: number;
  requester_email: string;
  opponent_email: string;
}
