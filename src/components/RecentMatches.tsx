import Link from "next/link";
import type { Match } from "@/lib/types";
import { Flag } from "./Flag";

/** Compact, read-only list of the most recent results for the homepage sidebar. */
export function RecentMatches({ matches, limit = 8 }: { matches: Match[]; limit?: number }) {
  const recent = matches.slice(0, limit);

  return (
    <aside className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          Latest results
        </h2>
        <Link href="/matches" className="text-xs text-emerald-400 hover:text-emerald-300">
          Add / edit →
        </Link>
      </div>

      {recent.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-800 px-4 py-6 text-center text-xs text-slate-500">
          No matches yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {recent.map((m) => {
            const homeWon = m.home_score > m.away_score;
            const awayWon = m.away_score > m.home_score;
            return (
              <li
                key={m.id}
                className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm"
              >
                {m.stage && (
                  <div className="mb-1 text-[10px] uppercase tracking-wide text-slate-500">
                    {m.stage}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="flex min-w-0 flex-1 items-center justify-end gap-1.5 text-right">
                    <span className={`truncate ${homeWon ? "font-semibold text-slate-100" : "text-slate-300"}`}>
                      {m.home_team}
                    </span>
                    <Flag team={m.home_team} className="text-sm" />
                  </span>
                  <span className="shrink-0 rounded bg-slate-800 px-1.5 py-0.5 font-mono text-xs font-semibold text-slate-100">
                    {m.home_score}–{m.away_score}
                  </span>
                  <span className="flex min-w-0 flex-1 items-center gap-1.5 text-left">
                    <Flag team={m.away_team} className="text-sm" />
                    <span className={`truncate ${awayWon ? "font-semibold text-slate-100" : "text-slate-300"}`}>
                      {m.away_team}
                    </span>
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
