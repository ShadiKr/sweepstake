"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { computePointsTimeline } from "@/lib/scoring";
import { DRAW } from "@/lib/teams";
import type { Match, Player, Standing, TeamStat, UpcomingFixture } from "@/lib/types";
import { Flag } from "./Flag";
import { Sparkline } from "./Sparkline";

const medals = ["🥇", "🥈", "🥉"];

export function LeaderboardTable({
  standings,
  teamStats,
  matches,
}: {
  standings: Standing[];
  teamStats: Record<string, TeamStat>;
  matches: Match[];
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
                matches={matches}
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
  matches,
  upcomingFixtures,
}: {
  standing: Standing;
  rank: number;
  isOpen: boolean;
  onToggle: () => void;
  teamStats: Record<string, TeamStat>;
  matches: Match[];
  upcomingFixtures: UpcomingFixture[];
}) {
  const isTop3 = rank < 3;
  return (
    <>
      <tr
        onClick={onToggle}
        className={`cursor-pointer transition-colors hover:bg-[#071130] ${
          isTop3 ? "bg-[#060f2a]" : "bg-[#040d24]"
        }`}
      >
        <td className="px-3 py-3 text-slate-400">
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
        </td>
        <td className="px-2 py-3 text-center text-slate-400">{s.played}</td>
        <td className="hidden px-2 py-3 text-center text-slate-400 sm:table-cell">{s.won}</td>
        <td className="hidden px-2 py-3 text-center text-slate-400 sm:table-cell">{s.drawn}</td>
        <td className="hidden px-2 py-3 text-center text-slate-400 sm:table-cell">{s.lost}</td>
        <td className="px-2 py-3 text-center text-slate-400">
          {s.gd > 0 ? `+${s.gd}` : s.gd}
        </td>
        <td className="px-3 py-3 text-right">
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
            <TeamBreakdown
              player={s.player}
              teamStats={teamStats}
              matches={matches}
              upcomingFixtures={upcomingFixtures}
            />
          </td>
        </tr>
      )}
    </>
  );
}

function TeamBreakdown({
  player,
  teamStats,
  matches,
  upcomingFixtures,
}: {
  player: Player;
  teamStats: Record<string, TeamStat>;
  matches: Match[];
  upcomingFixtures: UpcomingFixture[];
}) {
  const playerTeams = new Set(DRAW[player]);
  const teams = [...DRAW[player]].sort((a, b) => {
    const pa = teamStats[a]?.points ?? 0;
    const pb = teamStats[b]?.points ?? 0;
    return pb - pa;
  });

  const nextFixture = upcomingFixtures.find(
    (f) => playerTeams.has(f.homeTeam) || playerTeams.has(f.awayTeam),
  );

  const timeline = computePointsTimeline(matches, player);

  function fmtKickoff(iso: string): string {
    const d = new Date(iso);
    const today = new Date();
    const diffDays = Math.round(
      (new Date(iso).setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0)) / 86400000,
    );
    const dayStr = diffDays === 0 ? "Today" : diffDays === 1 ? "Tomorrow" :
      d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
    const time = d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
    return `${dayStr} ${time}`;
  }

  return (
    <div className="space-y-3">
      {(nextFixture || timeline.length > 1) && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          {nextFixture && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="text-slate-600">⏰</span>
              <span className="font-medium text-slate-300">
                {nextFixture.homeTeam} vs {nextFixture.awayTeam}
              </span>
              <span className="text-slate-600">·</span>
              <span>{fmtKickoff(nextFixture.kickoffAt)}</span>
            </div>
          )}
          {timeline.length > 1 && <Sparkline values={timeline} />}
        </div>
      )}
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
    </div>
  );
}
