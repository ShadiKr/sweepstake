"use client";

import { useState } from "react";
import { DRAW } from "@/lib/teams";
import type { Player, Standing, TeamStat } from "@/lib/types";
import { Flag } from "./Flag";

const medal = ["🥇", "🥈", "🥉"];

export function LeaderboardTable({
  standings,
  teamStats,
}: {
  standings: Standing[];
  teamStats: Record<string, TeamStat>;
}) {
  const [open, setOpen] = useState<Player | null>(null);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800">
      <table className="w-full text-sm">
        <thead className="bg-slate-900 text-xs uppercase tracking-wide text-slate-400">
          <tr>
            <th className="px-3 py-3 text-left font-medium">#</th>
            <th className="px-3 py-3 text-left font-medium">Player</th>
            <th className="px-2 py-3 text-center font-medium">P</th>
            <th className="hidden px-2 py-3 text-center font-medium sm:table-cell">W</th>
            <th className="hidden px-2 py-3 text-center font-medium sm:table-cell">D</th>
            <th className="hidden px-2 py-3 text-center font-medium sm:table-cell">L</th>
            <th className="px-2 py-3 text-center font-medium">GD</th>
            <th className="px-3 py-3 text-right font-medium text-slate-200">Pts</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
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
}: {
  standing: Standing;
  rank: number;
  isOpen: boolean;
  onToggle: () => void;
  teamStats: Record<string, TeamStat>;
}) {
  return (
    <>
      <tr
        onClick={onToggle}
        className="cursor-pointer bg-slate-950 transition hover:bg-slate-900/60"
      >
        <td className="px-3 py-3 text-slate-400">{medal[rank] ?? rank + 1}</td>
        <td className="px-3 py-3 font-medium">
          <span className="inline-flex items-center gap-2">
            <span className={`text-xs text-slate-500 transition ${isOpen ? "rotate-90" : ""}`}>
              ▶
            </span>
            {s.player}
          </span>
        </td>
        <td className="px-2 py-3 text-center text-slate-300">{s.played}</td>
        <td className="hidden px-2 py-3 text-center text-slate-300 sm:table-cell">{s.won}</td>
        <td className="hidden px-2 py-3 text-center text-slate-300 sm:table-cell">{s.drawn}</td>
        <td className="hidden px-2 py-3 text-center text-slate-300 sm:table-cell">{s.lost}</td>
        <td className="px-2 py-3 text-center text-slate-300">
          {s.gd > 0 ? `+${s.gd}` : s.gd}
        </td>
        <td className="px-3 py-3 text-right text-lg font-bold text-emerald-400">{s.points}</td>
      </tr>
      {isOpen && (
        <tr className="bg-slate-900/40">
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
            className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950 px-3 py-2"
          >
            <span className="flex items-center gap-2 font-medium text-slate-200">
              <Flag team={team} className="text-base" />
              {team}
            </span>
            <span className="text-xs text-slate-400">
              {t ? (
                <>
                  <span className="text-slate-300">{t.won}W</span> {t.drawn}D {t.lost}L ·{" "}
                  <span className="font-semibold text-emerald-400">{t.points} pts</span>
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
