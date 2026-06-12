"use client";

import { useState } from "react";
import { TEAM_OWNER } from "@/lib/teams";
import type { Match } from "@/lib/types";
import { Flag } from "./Flag";
import {
  MatchFields,
  toMatchBody,
  type MatchFormValue,
} from "./MatchFields";

export function MatchList({
  matches,
  loading,
  onChanged,
}: {
  matches: Match[];
  loading: boolean;
  onChanged: () => void;
}) {
  if (loading) {
    return <p className="text-sm text-slate-500">Loading matches…</p>;
  }
  if (matches.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-[#1a2d50] px-4 py-8 text-center text-sm text-slate-600">
        No matches yet. Add the first result above.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {matches.map((m) => (
        <MatchRow key={m.id} match={m} onChanged={onChanged} />
      ))}
    </div>
  );
}

function MatchRow({ match, onChanged }: { match: Match; onChanged: () => void }) {
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [value, setValue] = useState<MatchFormValue>(() => toFormValue(match));

  async function save() {
    setError(null);
    const body = toMatchBody(value);
    if (!body) {
      setError("Pick both teams and enter both scores.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/matches/${match.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to save.");
        return;
      }
      setEditing(false);
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirm("Delete this match?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/matches/${match.id}`, { method: "DELETE" });
      if (res.ok) onChanged();
    } finally {
      setBusy(false);
    }
  }

  if (editing) {
    return (
      <div className="space-y-3 rounded-xl border border-amber-500/30 bg-[#060f2a] p-4">
        <MatchFields value={value} onChange={setValue} />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="flex gap-2">
          <button
            onClick={save}
            disabled={busy}
            className="rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-bold text-slate-950 transition hover:bg-amber-400 disabled:opacity-50"
          >
            {busy ? "Saving…" : "Save"}
          </button>
          <button
            onClick={() => {
              setEditing(false);
              setValue(toFormValue(match));
              setError(null);
            }}
            disabled={busy}
            className="rounded-lg border border-[#1a2d50] px-3 py-1.5 text-sm text-slate-300 transition hover:bg-[#071130]"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  const winner =
    match.home_score > match.away_score
      ? "home"
      : match.home_score < match.away_score
        ? "away"
        : "draw";

  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#1a2d50] bg-[#040d24] px-4 py-3">
      <div className="min-w-0 flex-1">
        {match.stage && (
          <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-400/50">
            {match.stage}
          </div>
        )}
        <div className="flex items-center gap-2 text-sm">
          <TeamLabel name={match.home_team} bold={winner === "home"} align="right" />
          <span className={`shrink-0 rounded-md px-2 py-0.5 font-mono font-bold ${
            winner === "draw" ? "bg-[#1a2d50] text-slate-300" : "bg-[#0a1535] text-amber-300"
          }`}>
            {match.home_score}–{match.away_score}
          </span>
          <TeamLabel name={match.away_team} bold={winner === "away"} align="left" />
        </div>
        {match.pen_winner && (
          <div className="mt-0.5 text-xs text-amber-400/80">
            {match.pen_winner} won on penalties
          </div>
        )}
      </div>
      <div className="flex shrink-0 gap-1">
        <button
          onClick={() => setEditing(true)}
          disabled={busy}
          className="rounded-md px-2 py-1 text-xs text-slate-500 transition hover:bg-[#071130] hover:text-slate-100"
        >
          Edit
        </button>
        <button
          onClick={remove}
          disabled={busy}
          className="rounded-md px-2 py-1 text-xs text-red-400/80 transition hover:bg-red-950/50 hover:text-red-300"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

function TeamLabel({
  name,
  bold,
  align,
}: {
  name: string;
  bold: boolean;
  align: "left" | "right";
}) {
  const owner = TEAM_OWNER[name];
  return (
    <span
      className={`flex flex-1 items-center gap-2 ${
        align === "right" ? "flex-row-reverse text-right" : "flex-row text-left"
      }`}
    >
      <Flag team={name} className="text-base" />
      <span className="min-w-0">
        <span className={bold ? "font-semibold text-slate-100" : "text-slate-300"}>{name}</span>
        {owner && <span className="ml-1 text-xs text-slate-500">({owner})</span>}
      </span>
    </span>
  );
}

function toFormValue(m: Match): MatchFormValue {
  return {
    home_team: m.home_team,
    away_team: m.away_team,
    home_score: String(m.home_score),
    away_score: String(m.away_score),
    stage: m.stage ?? "",
    pen_winner: m.pen_winner ?? "",
  };
}
