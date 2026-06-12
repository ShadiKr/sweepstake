export type Player =
  | "Shadi"
  | "Leon"
  | "Cole"
  | "Fergus"
  | "Josh"
  | "Yaro"
  | "Connor"
  | "Emanuele";

/** A single match result, as stored in the database. */
export interface Match {
  id: number;
  home_team: string;
  away_team: string;
  home_score: number;
  away_score: number;
  stage: string | null;
  pen_winner: string | null;
  created_at: string;
}

/** A player's row in the leaderboard, computed from all matches. */
export interface Standing {
  player: Player;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number; // goals for
  ga: number; // goals against
  gd: number; // goal difference
  points: number;
}

/** Aggregated stats for a single team across all its matches. */
export interface TeamStat {
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  points: number;
}
