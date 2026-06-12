"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import type { Match } from "@/lib/types";
import { MatchForm } from "@/components/MatchForm";
import { MatchList } from "@/components/MatchList";

export default function MatchesPage() {
  const { data, isLoading, mutate } = useSWR<Match[]>("/api/matches", fetcher);
  const matches = data ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Matches</h1>
        <p className="mt-1 text-sm text-slate-400">
          Add a result for any two teams. Anyone can add, edit, or delete.
        </p>
      </div>

      <MatchForm onSaved={() => mutate()} />
      <MatchList matches={matches} loading={isLoading} onChanged={() => mutate()} />
    </div>
  );
}
