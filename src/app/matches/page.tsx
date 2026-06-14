"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import type { Match } from "@/lib/types";
import { MatchForm } from "@/components/MatchForm";
import { MatchList } from "@/components/MatchList";
import { SyncStatus } from "@/components/SyncStatus";

export default function MatchesPage() {
  const { data, isLoading, mutate } = useSWR<Match[]>("/api/matches", fetcher);
  const matches = data ?? [];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-400/80">
          FIFA World Cup 2026™
        </p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-white">Match Results</h1>
        <p className="mt-1 text-sm text-slate-400">
          Add a result for any two teams. Anyone can add, edit, or delete.
        </p>
      </div>

      <SyncStatus />
      <MatchForm onSaved={() => mutate()} />
      <MatchList matches={matches} loading={isLoading} onChanged={() => mutate()} />
    </div>
  );
}
