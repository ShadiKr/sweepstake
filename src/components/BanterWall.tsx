"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { MAX_COMMENT_LENGTH } from "@/lib/social";
import { useIdentity } from "@/lib/useIdentity";
import type { Comment } from "@/lib/types";
import { IdentityPicker } from "./IdentityPicker";

function timeAgo(iso: string): string {
  const secs = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function BanterWall() {
  const [me] = useIdentity();
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: comments = [], mutate } = useSWR<Comment[]>("/api/comments", fetcher, {
    refreshInterval: 15000,
  });

  async function post() {
    const text = body.trim();
    if (!text) return;
    if (!me) {
      setError("Pick your name first.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author: me, body: text }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to post.");
        return;
      }
      setBody("");
      mutate();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-slate-500">
          {me ? "Posting as" : "Set a name to post"}
        </p>
        <IdentityPicker compact />
      </div>

      <div className="space-y-2 rounded-xl border border-[#1a2d50] bg-[#040d24] p-3">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={me ? "Talk your talk…" : "Pick your name above first…"}
          maxLength={MAX_COMMENT_LENGTH}
          rows={2}
          className="w-full resize-none rounded-lg border border-[#1a2d50] bg-[#060f2a] px-3 py-2 text-base text-slate-100 placeholder:text-slate-600 focus:border-amber-500/50 focus:outline-none sm:text-sm"
        />
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-600">
            {body.length}/{MAX_COMMENT_LENGTH}
          </span>
          <button
            onClick={post}
            disabled={busy || !body.trim()}
            className="rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-bold text-slate-950 transition hover:bg-amber-400 disabled:opacity-40"
          >
            {busy ? "Posting…" : "Post"}
          </button>
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>

      {comments.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[#1a2d50] px-4 py-8 text-center text-sm text-slate-600">
          No banter yet. Be the first to talk smack.
        </p>
      ) : (
        <ul className="space-y-2">
          {comments.map((c) => (
            <li
              key={c.id}
              className="rounded-xl border border-[#1a2d50] bg-[#040d24] px-3 py-2"
            >
              <div className="mb-0.5 flex items-baseline justify-between gap-2">
                <span className="text-sm font-semibold text-amber-300">{c.author}</span>
                <span className="text-[10px] text-slate-600">{timeAgo(c.created_at)}</span>
              </div>
              <p className="whitespace-pre-wrap break-words text-sm text-slate-200">{c.body}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
