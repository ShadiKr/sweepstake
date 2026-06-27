"use client";

import type { Standing } from "@/lib/types";

const medals = ["🥇", "🥈", "🥉"];

function buildText(standings: Standing[]): string {
  const lines = standings.map((s, i) => {
    const rank = medals[i] ?? `${i + 1}.`;
    return `${rank} ${s.player} — ${s.points}`;
  });
  const url = typeof window !== "undefined" ? window.location.origin : "";
  return [`🏆 Beer Sweepstake — World Cup 2026`, "", ...lines, "", url]
    .filter((l) => l !== undefined)
    .join("\n");
}

export function ShareStandings({ standings }: { standings: Standing[] }) {
  async function share() {
    const text = buildText(standings);
    // Prefer the native share sheet (mobile → WhatsApp/anything); fall back to
    // WhatsApp's web link on desktop.
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ text });
        return;
      } catch {
        // user cancelled or share failed — fall through to the link
      }
    }
    const wa = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(wa, "_blank", "noopener,noreferrer");
  }

  return (
    <button
      onClick={share}
      disabled={standings.length === 0}
      className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/40 px-2.5 py-1 text-xs font-semibold text-amber-300 transition hover:bg-amber-500/10 disabled:opacity-40"
    >
      <span>📤</span>
      Share
    </button>
  );
}
