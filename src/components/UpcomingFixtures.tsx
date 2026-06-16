"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { TEAM_OWNER } from "@/lib/teams";
import type { UpcomingFixture } from "@/lib/types";
import { Flag } from "./Flag";

function dayLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const diffDays = Math.round(
    (d.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0)) / 86400000,
  );
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function kickoffTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function groupByDay(fixtures: UpcomingFixture[]): [string, UpcomingFixture[]][] {
  const map = new Map<string, UpcomingFixture[]>();
  for (const f of fixtures) {
    const key = new Date(f.kickoffAt).toDateString();
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(f);
  }
  return [...map.entries()];
}

export function UpcomingFixtures() {
  const { data } = useSWR<UpcomingFixture[]>("/api/fixtures", fetcher, {
    refreshInterval: 60000,
  });

  const fixtures = data ?? [];

  return (
    <aside className="space-y-3">
      <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400/80">
        Coming Up
      </h2>

      {fixtures.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[#1a2d50] px-4 py-6 text-center text-xs text-slate-600">
          {data ? "No upcoming fixtures." : "Loading…"}
        </p>
      ) : (
        <div className="space-y-3">
          {groupByDay(fixtures).map(([dayKey, group]) => (
            <div key={dayKey}>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                {dayLabel(group[0].kickoffAt)}
              </p>
              <ul className="space-y-1.5">
                {group.map((f) => (
                  <li
                    key={f.externalId}
                    className="rounded-lg border border-[#1a2d50] bg-[#040d24] px-3 py-2 text-sm"
                  >
                    {f.stage && (
                      <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-amber-400/50">
                        {f.stage}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="flex min-w-0 flex-1 flex-col items-end text-right">
                        <span className="flex items-center gap-1.5">
                          <span className="truncate text-xs text-slate-300">{f.homeTeam}</span>
                          <Flag team={f.homeTeam} className="text-sm" />
                        </span>
                        {TEAM_OWNER[f.homeTeam] && (
                          <span className="text-[10px] text-slate-600">{TEAM_OWNER[f.homeTeam]}</span>
                        )}
                      </span>
                      <span className="shrink-0 rounded px-1.5 py-0.5 font-mono text-xs font-bold text-slate-500 bg-[#1a2d50]">
                        {kickoffTime(f.kickoffAt)}
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col items-start text-left">
                        <span className="flex items-center gap-1.5">
                          <Flag team={f.awayTeam} className="text-sm" />
                          <span className="truncate text-xs text-slate-300">{f.awayTeam}</span>
                        </span>
                        {TEAM_OWNER[f.awayTeam] && (
                          <span className="text-[10px] text-slate-600">{TEAM_OWNER[f.awayTeam]}</span>
                        )}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}
