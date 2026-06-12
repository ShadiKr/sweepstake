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
      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-[#071640] via-[#0a1e50] to-[#02071a] px-6 py-7">
        {/* Decorative blurred trophy glow */}
        <div className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-blue-400/10 blur-3xl" />

        <div className="relative flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-400">
              FIFA World Cup 2026™
            </p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-white">
              Sweepstake
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              June 11 – July 19, 2026 &nbsp;·&nbsp; USA · Canada · Mexico
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {matches.length} match{matches.length === 1 ? "" : "es"} played · tap a player to see their teams
            </p>
          </div>
          <div className="shrink-0 text-6xl drop-shadow-lg" aria-hidden>
            🏆
          </div>
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-300">
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
