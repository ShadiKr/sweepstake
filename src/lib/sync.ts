import { fetchWorldCupFixtures, FootballDataError } from "./football-data";
import {
  getLastSyncedAt,
  setLastSyncedAt,
  setUpcomingFixtures,
  upsertExternalMatch,
} from "./matches-store";
import { resolveTeam } from "./team-matching";
import type { SyncResult, UpcomingFixture } from "./types";

/** Minimum time between automatic syncs. Low enough to sync on effectively every page load. */
const MIN_INTERVAL_MS = 10_000; // 10 seconds

/**
 * Pull World Cup fixtures from football-data.org and upsert them into the DB.
 *
 * - Throttled: skips if a sync ran within MIN_INTERVAL_MS, unless `force`.
 * - Only stores fixtures that have a score (started or finished).
 * - Never overwrites a locked (manually overridden) row.
 * - Reports any team names it couldn't map so aliases can be added.
 */
export async function syncMatches({ force = false } = {}): Promise<SyncResult> {
  const token = process.env.FOOTBALL_DATA_TOKEN;
  if (!token) {
    return { ok: false, skipped: "no_token" };
  }

  const lastSyncedAt = await getLastSyncedAt();
  if (!force && lastSyncedAt) {
    const age = Date.now() - new Date(lastSyncedAt).getTime();
    if (age < MIN_INTERVAL_MS) {
      return { ok: true, skipped: "throttled", lastSyncedAt };
    }
  }

  let fixtures;
  try {
    fixtures = await fetchWorldCupFixtures(token);
  } catch (err) {
    const error =
      err instanceof FootballDataError
        ? err.message
        : "Failed to reach football-data.org";
    return { ok: false, error, lastSyncedAt };
  }

  const unmatched = new Set<string>();
  let inserted = 0;
  let updated = 0;
  let ignored = 0;

  for (const f of fixtures) {
    // No score yet (scheduled match) — nothing to record.
    if (f.homeScore == null || f.awayScore == null) {
      ignored += 1;
      continue;
    }

    const home = resolveTeam(f.homeName);
    const away = resolveTeam(f.awayName);
    if (!home) unmatched.add(f.homeName);
    if (!away) unmatched.add(f.awayName);
    if (!home || !away) {
      ignored += 1;
      continue;
    }

    const penWinner =
      f.penWinner === "HOME" ? home : f.penWinner === "AWAY" ? away : null;

    const outcome = await upsertExternalMatch({
      external_id: f.externalId,
      home_team: home,
      away_team: away,
      home_score: f.homeScore,
      away_score: f.awayScore,
      stage: f.stage,
      pen_winner: penWinner,
      played_at: f.utcDate,
    });

    if (outcome === "inserted") inserted += 1;
    else if (outcome === "updated") updated += 1;
    else ignored += 1; // skipped (locked)
  }

  // Also store upcoming (unscored) fixtures for the "Coming Up" sidebar.
  const upcoming: UpcomingFixture[] = [];
  for (const f of fixtures) {
    if (f.homeScore != null || f.awayScore != null) continue;
    const home = resolveTeam(f.homeName);
    const away = resolveTeam(f.awayName);
    if (!home && !away) continue; // neither team is in the draw
    upcoming.push({
      externalId: f.externalId,
      homeTeam: home ?? f.homeName,
      awayTeam: away ?? f.awayName,
      kickoffAt: f.utcDate,
      stage: f.stage,
    });
  }
  upcoming.sort((a, b) => a.kickoffAt.localeCompare(b.kickoffAt));
  await setUpcomingFixtures(upcoming.slice(0, 15));

  const now = new Date().toISOString();
  await setLastSyncedAt(now);

  return {
    ok: true,
    inserted,
    updated,
    ignored,
    unmatchedTeams: [...unmatched],
    lastSyncedAt: now,
  };
}
