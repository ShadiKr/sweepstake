"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { computeCumulativePoints } from "@/lib/scoring";
import { useAutoSync } from "@/lib/useAutoSync";
import type { Match } from "@/lib/types";
import { PointsChart } from "@/components/PointsChart";

export default function ChartPage() {
  useAutoSync();
  const { data, isLoading } = useSWR<Match[]>("/api/matches", fetcher, {
    refreshInterval: 15000,
  });

  const timeline = computeCumulativePoints(data ?? []);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-400/80">
          FIFA World Cup 2026™
        </p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-white">Points Over Time</h1>
        <p className="mt-1 text-sm text-slate-400">
          Each player&apos;s cumulative points as results are entered.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : (
        <PointsChart timeline={timeline} />
      )}
    </div>
  );
}
