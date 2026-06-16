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
  /** The football-data.org match id, when this row came from the API. */
  external_id: string | null;
  /** Where the row came from: "auto" (synced) or "manual" (entered by hand). */
  source: "auto" | "manual";
  /** When true, the auto-sync will not overwrite this row (a manual override). */
  locked: boolean;
  created_at: string;
}

/** Outcome of a sync run, returned by /api/sync. */
export interface SyncResult {
  ok: boolean;
  /** Why nothing happened, if applicable. */
  skipped?: "no_token" | "throttled";
  error?: string;
  inserted?: number;
  updated?: number;
  /** Fixtures seen but not stored (no score yet, locked, or team not matched). */
  ignored?: number;
  /** API team names we couldn't map to a player's team — report these to fix. */
  unmatchedTeams?: string[];
  lastSyncedAt?: string | null;
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

/** An upcoming (not yet played) fixture from the auto-sync, stored in sync_state. */
export interface UpcomingFixture {
  externalId: string;
  homeTeam: string;
  awayTeam: string;
  /** UTC kickoff time as ISO string. */
  kickoffAt: string;
  stage: string | null;
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
