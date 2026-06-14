/**
 * Thin client for football-data.org (v4), used to pull World Cup fixtures.
 *
 * Auth is via the `X-Auth-Token` header. The free tier is rate limited
 * (~10 requests/minute); we make a single request per sync and the sync is
 * throttled, so we stay well under it. We still read the throttle headers and
 * surface them, as the API provider recommends.
 */

const BASE = "https://api.football-data.org/v4";
const COMPETITION = "WC"; // FIFA World Cup

export interface ApiFixture {
  externalId: string;
  homeName: string;
  awayName: string;
  /** Regulation/full-time score; null until the match has a score. */
  homeScore: number | null;
  awayScore: number | null;
  /** Friendly stage/group label, e.g. "Group A" or "Round of 16". */
  stage: string | null;
  /** "HOME" | "AWAY" if a knockout tie was settled on penalties, else null. */
  penWinner: "HOME" | "AWAY" | null;
  status: string;
}

interface RawMatch {
  id: number;
  status: string;
  stage: string;
  group: string | null;
  homeTeam: { name: string | null };
  awayTeam: { name: string | null };
  score: {
    winner: string | null;
    duration: string | null;
    fullTime: { home: number | null; away: number | null };
    penalties?: { home: number | null; away: number | null };
  };
}

const STAGE_LABELS: Record<string, string> = {
  GROUP_STAGE: "Group Stage",
  LAST_16: "Round of 16",
  ROUND_OF_16: "Round of 16",
  QUARTER_FINALS: "Quarter-final",
  SEMI_FINALS: "Semi-final",
  THIRD_PLACE: "Third place",
  FINAL: "Final",
};

function stageLabel(m: RawMatch): string | null {
  if (m.group) {
    // The API returns e.g. "GROUP_A"; show it as "Group A".
    const g = m.group.replace(/_/g, " ").toLowerCase();
    return g.replace(/\b\w/g, (c) => c.toUpperCase());
  }
  return STAGE_LABELS[m.stage] ?? null;
}

export class FootballDataError extends Error {}

/** Fetch all World Cup fixtures. Throws FootballDataError on a non-OK response. */
export async function fetchWorldCupFixtures(token: string): Promise<ApiFixture[]> {
  const res = await fetch(`${BASE}/competitions/${COMPETITION}/matches`, {
    headers: { "X-Auth-Token": token },
    // Always get fresh data; the sync layer handles throttling.
    cache: "no-store",
  });

  if (!res.ok) {
    const remaining = res.headers.get("X-Requests-Available-Minute");
    let detail = "";
    try {
      const body = (await res.json()) as { message?: string };
      detail = body.message ? ` — ${body.message}` : "";
    } catch {
      /* ignore */
    }
    throw new FootballDataError(
      `football-data.org responded ${res.status}${detail}` +
        (remaining != null ? ` (requests left this minute: ${remaining})` : ""),
    );
  }

  const data = (await res.json()) as { matches?: RawMatch[] };
  const matches = data.matches ?? [];

  return matches.map((m) => {
    const shootout = m.score.duration === "PENALTY_SHOOTOUT";
    let penWinner: "HOME" | "AWAY" | null = null;
    if (shootout && m.score.winner === "HOME_TEAM") penWinner = "HOME";
    else if (shootout && m.score.winner === "AWAY_TEAM") penWinner = "AWAY";

    return {
      externalId: String(m.id),
      homeName: m.homeTeam.name ?? "",
      awayName: m.awayTeam.name ?? "",
      homeScore: m.score.fullTime.home,
      awayScore: m.score.fullTime.away,
      stage: stageLabel(m),
      penWinner,
      status: m.status,
    };
  });
}
