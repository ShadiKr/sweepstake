"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { computeStandings, computeTeamStats } from "@/lib/scoring";
import type { Match } from "@/lib/types";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { RecentMatches } from "@/components/RecentMatches";

export default function Home() {
  const { data, error, isLoading } = useSWR<Match[]>("/api/matches", fetcher, {
    refreshInterval: 15000,
  });

  const matches = data ?? [];
  const standings = computeStandings(matches);
  const teamStats = computeTeamStats(matches);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Leaderboard</h1>
        <p className="mt-1 text-sm text-slate-400">
          {matches.length} match{matches.length === 1 ? "" : "es"} played · tap a player to
          see their teams
        </p>
      </div>

      {error && (
        <p className="rounded-lg border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300">
          Couldn&apos;t load matches. Check the database connection.
        </p>
      )}

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <LeaderboardTable standings={standings} teamStats={teamStats} />
          </div>
          <RecentMatches matches={matches} />
        </div>
      )}
    </div>
  );
}
