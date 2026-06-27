import Link from "next/link";
import type { Match } from "@/lib/types";
import { TEAM_OWNER } from "@/lib/teams";
import { Flag } from "./Flag";
import { IdentityPicker } from "./IdentityPicker";
import { ReactionBar } from "./ReactionBar";

export function RecentMatches({ matches, limit = 8 }: { matches: Match[]; limit?: number }) {
  const recent = matches.slice(0, limit);

  return (
    <aside className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400/80">
          Latest Results
        </h2>
        <div className="flex items-center gap-2">
          <IdentityPicker compact />
          <Link
            href="/matches"
            className="text-xs text-slate-500 transition-colors hover:text-amber-400"
          >
            Add / edit →
          </Link>
        </div>
      </div>

      {recent.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[#1a2d50] px-4 py-6 text-center text-xs text-slate-600">
          No matches yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {recent.map((m) => {
            const homeWon = m.home_score > m.away_score;
            const awayWon = m.away_score > m.home_score;
            const isDraw = m.home_score === m.away_score;
            return (
              <li
                key={m.id}
                className="rounded-lg border border-[#1a2d50] bg-[#040d24] px-3 py-2 text-sm"
              >
                {m.stage && (
                  <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-amber-400/50">
                    {m.stage}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="flex min-w-0 flex-1 items-center justify-end gap-1.5 text-right">
                    <span className="min-w-0">
                      <span
                        className={`block truncate text-xs ${
                          homeWon ? "font-bold text-slate-100" : "text-slate-400"
                        }`}
                      >
                        {m.home_team}
                      </span>
                      {TEAM_OWNER[m.home_team] && (
                        <span className="block truncate text-[10px] text-slate-600">
                          {TEAM_OWNER[m.home_team]}
                        </span>
                      )}
                    </span>
                    <Flag team={m.home_team} className="text-sm" />
                  </span>
                  <span
                    className={`shrink-0 rounded px-1.5 py-0.5 font-mono text-xs font-bold ${
                      isDraw
                        ? "bg-[#1a2d50] text-slate-300"
                        : "bg-[#0a1535] text-amber-300"
                    }`}
                  >
                    {m.home_score}–{m.away_score}
                  </span>
                  <span className="flex min-w-0 flex-1 items-center gap-1.5 text-left">
                    <Flag team={m.away_team} className="text-sm" />
                    <span className="min-w-0">
                      <span
                        className={`block truncate text-xs ${
                          awayWon ? "font-bold text-slate-100" : "text-slate-400"
                        }`}
                      >
                        {m.away_team}
                      </span>
                      {TEAM_OWNER[m.away_team] && (
                        <span className="block truncate text-[10px] text-slate-600">
                          {TEAM_OWNER[m.away_team]}
                        </span>
                      )}
                    </span>
                  </span>
                </div>
                <ReactionBar matchId={m.id} />
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
