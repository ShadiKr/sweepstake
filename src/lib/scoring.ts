import type { Match, Player, Standing, TeamStat } from "./types";
import { PLAYERS, TEAM_OWNER } from "./teams";

/**
 * Compute the player leaderboard from the full list of matches.
 *
 * Scoring: for every match, each team earns 3 points for a win and 1 for a
 * draw, credited to the player who owns that team. Penalty shootouts do not
 * change the points — the result follows the 90/120-minute score (a draw is
 * 1 point each); `pen_winner` is for display only.
 *
 * Pure function: same input always yields the same standings.
 */
export function computeStandings(matches: Match[]): Standing[] {
  const table = Object.fromEntries(
    PLAYERS.map((player) => [
      player,
      { player, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0 },
    ]),
  ) as Record<Player, Standing>;

  for (const match of matches) {
    applyResult(table, TEAM_OWNER[match.home_team], match.home_score, match.away_score);
    applyResult(table, TEAM_OWNER[match.away_team], match.away_score, match.home_score);
  }

  for (const player of PLAYERS) {
    table[player].gd = table[player].gf - table[player].ga;
  }

  return Object.values(table).sort(
    (a, b) =>
      b.points - a.points ||
      b.gd - a.gd ||
      b.gf - a.gf ||
      a.player.localeCompare(b.player),
  );
}

function applyResult(
  table: Record<Player, Standing>,
  owner: Player | undefined,
  scored: number,
  conceded: number,
): void {
  if (!owner) return; // team not part of the draw — ignore defensively
  const row = table[owner];
  row.played += 1;
  row.gf += scored;
  row.ga += conceded;
  if (scored > conceded) {
    row.won += 1;
    row.points += 3;
  } else if (scored === conceded) {
    row.drawn += 1;
    row.points += 1;
  } else {
    row.lost += 1;
  }
}

/**
 * Aggregate per-team stats across all matches, keyed by team name.
 * Used for the expandable per-player breakdown on the leaderboard.
 */
export function computeTeamStats(matches: Match[]): Record<string, TeamStat> {
  const stats: Record<string, TeamStat> = {};
  const ensure = (team: string): TeamStat =>
    (stats[team] ??= {
      team,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      gf: 0,
      ga: 0,
      points: 0,
    });

  for (const match of matches) {
    const home = ensure(match.home_team);
    const away = ensure(match.away_team);
    home.played += 1;
    away.played += 1;
    home.gf += match.home_score;
    home.ga += match.away_score;
    away.gf += match.away_score;
    away.ga += match.home_score;

    if (match.home_score > match.away_score) {
      home.won += 1;
      home.points += 3;
      away.lost += 1;
    } else if (match.home_score < match.away_score) {
      away.won += 1;
      away.points += 3;
      home.lost += 1;
    } else {
      home.drawn += 1;
      away.drawn += 1;
      home.points += 1;
      away.points += 1;
    }
  }

  return stats;
}
