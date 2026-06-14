"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { fetcher } from "@/lib/fetcher";
import type { SyncResult } from "@/lib/types";

interface SyncStatusData {
  lastSyncedAt: string | null;
  configured: boolean;
}

function timeAgo(iso: string | null): string {
  if (!iso) return "never";
  const secs = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 60) return "just now";
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.round(hrs / 24)} d ago`;
}

function describe(r: SyncResult): { text: string; tone: "ok" | "warn" | "err" } {
  if (r.skipped === "no_token")
    return { text: "Auto-sync isn’t configured (no API token set).", tone: "warn" };
  if (!r.ok) return { text: r.error ?? "Sync failed.", tone: "err" };
  if (r.skipped === "throttled")
    return { text: "Synced moments ago — try again shortly.", tone: "ok" };
  const parts = [`${r.inserted ?? 0} added`, `${r.updated ?? 0} updated`];
  let text = `Synced · ${parts.join(", ")}.`;
  if (r.unmatchedTeams && r.unmatchedTeams.length > 0) {
    text += ` Couldn’t match: ${r.unmatchedTeams.join(", ")}.`;
    return { text, tone: "warn" };
  }
  return { text, tone: "ok" };
}

export function SyncStatus() {
  const { data } = useSWR<SyncStatusData>("/api/sync", fetcher, {
    refreshInterval: 30000,
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; tone: "ok" | "warn" | "err" } | null>(null);

  async function syncNow() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      const result = (await res.json()) as SyncResult;
      setMsg(describe(result));
      mutate("/api/sync");
      mutate("/api/matches");
    } catch {
      setMsg({ text: "Sync failed — network error.", tone: "err" });
    } finally {
      setBusy(false);
    }
  }

  const toneClass =
    msg?.tone === "err"
      ? "text-red-400"
      : msg?.tone === "warn"
        ? "text-amber-400"
        : "text-emerald-400";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#1a2d50] bg-[#060f2a] px-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-200">
          {data?.configured === false ? "Manual entry" : "Auto-updating scores"}
        </p>
        <p className="mt-0.5 text-xs text-slate-500">
          {data?.configured === false
            ? "Scores are entered by hand below."
            : `From football-data.org · last synced ${timeAgo(data?.lastSyncedAt ?? null)}`}
        </p>
        {msg && <p className={`mt-1 text-xs ${toneClass}`}>{msg.text}</p>}
      </div>
      <button
        onClick={syncNow}
        disabled={busy}
        className="shrink-0 rounded-lg border border-amber-500/40 px-3 py-1.5 text-sm font-semibold text-amber-400 transition hover:bg-amber-500/10 disabled:opacity-50"
      >
        {busy ? "Syncing…" : "Sync now"}
      </button>
    </div>
  );
}
