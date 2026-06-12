"use client";

import { useState } from "react";
import { MatchFields, emptyMatch, toMatchBody, type MatchFormValue } from "./MatchFields";

export function MatchForm({ onSaved }: { onSaved: () => void }) {
  const [value, setValue] = useState<MatchFormValue>(emptyMatch);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const body = toMatchBody(value);
    if (!body) {
      setError("Pick both teams and enter both scores.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to save match.");
        return;
      }
      setValue(emptyMatch);
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/40 p-4"
    >
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
        Add a result
      </h2>
      <MatchFields value={value} onChange={setValue} />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? "Saving…" : "Add match"}
      </button>
    </form>
  );
}
