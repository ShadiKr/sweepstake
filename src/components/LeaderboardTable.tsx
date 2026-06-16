"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { DRAW } from "@/lib/teams";
import type { Player, Standing, TeamStat, UpcomingFixture } from "@/lib/types";
import { Flag } from "./Flag";

const medals = ["🥇", "🥈", "🥉"];


export function LeaderboardTable({
  standings,
  teamStats,
}: {
  standings: Standing[];
  teamStats: Record<string, TeamStat>;
}) {
  const [open, setOpen] = useState<Player | null>(null);
  const { data: upcomingFixtures = [] } = useSWR<UpcomingFixture[]>(
    "/api/fixtures",
    fetcher,
    { refreshInterval: 60000 },
  );

  return (
    <div className="overflow-hidden rounded-xl border border-[#1a2d50]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-amber-500/30 bg-[#071130]">
            <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider text-amber-400/70">#</th>
            <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider text-amber-400/70">Player</th>
            <th className="px-2 py-3 text-center text-xs font-bold uppercase tracking-wider text-amber-400/70">P</th>
            <th className="hidden px-2 py-3 text-center text-xs font-bold uppercase tracking-wider text-amber-400/70 sm:table-cell">W</th>
            <th className="hidden px-2 py-3 text-center text-xs font-bold uppercase tracking-wider text-amber-400/70 sm:table-cell">D</th>
            <th className="hidden px-2 py-3 text-center text-xs font-bold uppercase tracking-wider text-amber-400/70 sm:table-cell">L</th>
            <th className="px-2 py-3 text-center text-xs font-bold uppercase tracking-wider text-amber-400/70">GD</th>
            <th className="px-3 py-3 text-right text-xs font-bold uppercase tracking-wider text-amber-400">Pts</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#0f1f3d]">
          {standings.map((s, i) => {
            const isOpen = open === s.player;
            return (
              <FragmentRow
                key={s.player}
                standing={s}
                rank={i}
                isOpen={isOpen}
                onToggle={() => setOpen(isOpen ? null : s.player)}
                teamStats={teamStats}
                upcomingFixtures={upcomingFixtures}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function FragmentRow({
  standing: s,
  rank,
  isOpen,
  onToggle,
  teamStats,
  upcomingFixtures,
}: {
  standing: Standing;
  rank: number;
  isOpen: boolean;
  onToggle: () => void;
  teamStats: Record<string, TeamStat>;
  upcomingFixtures: UpcomingFixture[];
}) {
  const isTop3 = rank < 3;
  const playerTeams = new Set(DRAW[s.player]);
  const nextFixture = upcomingFixtures.find(
    (f) => playerTeams.has(f.homeTeam) || playerTeams.has(f.awayTeam),
  );

  return (
    <>
      <tr
        onClick={onToggle}
        className={`cursor-pointer transition-colors hover:bg-[#071130] ${
          isTop3 ? "bg-[#060f2a]" : "bg-[#040d24]"
        }`}
      >
        <td className="px-3 py-3 align-top text-slate-400">
          {medals[rank] ?? <span className="text-slate-600">{rank + 1}</span>}
        </td>
        <td className="px-3 py-3 font-semibold text-slate-100">
          <span className="inline-flex items-center gap-2">
            <span
              className={`text-xs text-slate-600 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
            >
              ▶
            </span>
            {s.player}
          </span>
          {nextFixture && (
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-400/80">
              Next Up
            </span>
          )}
        </td>
        <td className="px-2 py-3 align-top text-center text-slate-400 sm:align-middle">{s.played}</td>
        <td className="hidden px-2 py-3 text-center align-top text-slate-400 sm:table-cell sm:align-middle">{s.won}</td>
        <td className="hidden px-2 py-3 text-center align-top text-slate-400 sm:table-cell sm:align-middle">{s.drawn}</td>
        <td className="hidden px-2 py-3 text-center align-top text-slate-400 sm:table-cell sm:align-middle">{s.lost}</td>
        <td className="px-2 py-3 align-top text-center text-slate-400 sm:align-middle">
          {s.gd > 0 ? `+${s.gd}` : s.gd}
        </td>
        <td className="px-3 py-3 align-top text-right sm:align-middle">
          <span
            className={`text-lg font-black tabular-nums ${
              rank === 0
                ? "text-amber-400"
                : rank === 1
                  ? "text-slate-300"
                  : rank === 2
                    ? "text-amber-700"
                    : "text-slate-400"
            }`}
          >
            {s.points}
          </span>
        </td>
      </tr>
      {isOpen && (
        <tr className="bg-[#071130]">
          <td colSpan={8} className="px-3 py-3">
            <TeamBreakdown player={s.player} teamStats={teamStats} />
          </td>
        </tr>
      )}
    </>
  );
}

function TeamBreakdown({
  player,
  teamStats,
}: {
  player: Player;
  teamStats: Record<string, TeamStat>;
}) {
  const teams = [...DRAW[player]].sort((a, b) => {
    const pa = teamStats[a]?.points ?? 0;
    const pb = teamStats[b]?.points ?? 0;
    return pb - pa;
  });

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {teams.map((team) => {
        const t = teamStats[team];
        return (
          <div
            key={team}
            className="flex items-center justify-between rounded-lg border border-[#1a2d50] bg-[#040d24] px-3 py-2"
          >
            <span className="flex items-center gap-2 text-sm font-medium text-slate-200">
              <Flag team={team} className="text-base" />
              {team}
            </span>
            <span className="text-xs text-slate-400">
              {t ? (
                <>
                  <span className="text-slate-300">{t.won}W</span> {t.drawn}D {t.lost}L ·{" "}
                  <span className="font-bold text-amber-400">{t.points} pts</span>
                </>
              ) : (
                <span className="text-slate-600">no games yet</span>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}
