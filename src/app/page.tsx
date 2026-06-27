"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { computeStandings, computeTeamStats } from "@/lib/scoring";
import { useAutoSync } from "@/lib/useAutoSync";
import type { Match } from "@/lib/types";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { RecentMatches } from "@/components/RecentMatches";
import { ShareStandings } from "@/components/ShareStandings";
import { TeamLookup } from "@/components/TeamLookup";
import { UpcomingFixtures } from "@/components/UpcomingFixtures";

export default function Home() {
  useAutoSync();
  const { data, error, isLoading } = useSWR<Match[]>("/api/matches", fetcher, {
    refreshInterval: 15000,
  });

  const matches = data ?? [];
  const standings = computeStandings(matches);
  const teamStats = computeTeamStats(matches);

  return (
    <div className="space-y-6">
      {error && (
        <p className="rounded-lg border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-300">
          Couldn&apos;t load matches. Check the database connection.
        </p>
      )}

      <TeamLookup />

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400/80">
                Standings
              </h2>
              <ShareStandings standings={standings} />
            </div>
            <LeaderboardTable standings={standings} teamStats={teamStats} />
          </div>
          <div className="space-y-6">
            <RecentMatches matches={matches} />
            <UpcomingFixtures />
          </div>
        </div>
      )}
    </div>
  );
}
