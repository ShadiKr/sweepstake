"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { REACTION_EMOJIS } from "@/lib/social";
import { useIdentity } from "@/lib/useIdentity";
import type { Reaction } from "@/lib/types";

/**
 * Emoji reactions for a single match. All reactions are fetched once (shared
 * SWR cache key) and aggregated client-side per match, so adding this under
 * every match costs a single request, not one per row.
 */
export function ReactionBar({ matchId }: { matchId: number }) {
  const [me] = useIdentity();
  const [needName, setNeedName] = useState(false);
  const { data: all = [], mutate } = useSWR<Reaction[]>("/api/reactions", fetcher, {
    refreshInterval: 15000,
  });

  const mine = all.filter((r) => r.match_id === matchId);

  async function toggle(emoji: string) {
    if (!me) {
      setNeedName(true);
      return;
    }
    setNeedName(false);
    // Optimistic: flip my reaction locally, then revalidate from the server.
    const exists = mine.some((r) => r.emoji === emoji && r.author === me);
    const optimistic = exists
      ? all.filter((r) => !(r.match_id === matchId && r.emoji === emoji && r.author === me))
      : [...all, { id: -Date.now(), match_id: matchId, emoji, author: me, created_at: "" }];
    await mutate(
      async () => {
        const res = await fetch("/api/reactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ matchId, emoji, author: me }),
        });
        if (!res.ok) throw new Error("Failed to react");
        return res.json();
      },
      { optimisticData: optimistic, rollbackOnError: true, revalidate: false },
    );
  }

  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-1">
      {REACTION_EMOJIS.map((emoji) => {
        const forEmoji = mine.filter((r) => r.emoji === emoji);
        const count = forEmoji.length;
        const reacted = !!me && forEmoji.some((r) => r.author === me);
        return (
          <button
            key={emoji}
            onClick={() => toggle(emoji)}
            title={count ? forEmoji.map((r) => r.author).join(", ") : "React"}
            className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-xs transition ${
              reacted
                ? "border-amber-500/50 bg-amber-500/15"
                : "border-transparent bg-[#0a1535] hover:border-[#1a2d50]"
            } ${count === 0 ? "opacity-60 hover:opacity-100" : ""}`}
          >
            <span>{emoji}</span>
            {count > 0 && <span className="text-[10px] text-slate-400">{count}</span>}
          </button>
        );
      })}
      {needName && (
        <span className="text-[10px] text-amber-400/80">← pick your name first</span>
      )}
    </div>
  );
}
