"use client";

import { useState } from "react";
import { PLAYERS } from "@/lib/teams";
import { MAX_AUTHOR_LENGTH } from "@/lib/social";
import { useIdentity } from "@/lib/useIdentity";

/**
 * Lets a user say who they are (one of the 8 players, or a custom name), stored
 * in localStorage. Used to attribute reactions and Banter comments — the app is
 * intentionally open / no-login.
 */
export function IdentityPicker({ compact = false }: { compact?: boolean }) {
  const [me, setMe] = useIdentity();
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState("");

  function choose(name: string) {
    const trimmed = name.trim().slice(0, MAX_AUTHOR_LENGTH);
    if (!trimmed) return;
    setMe(trimmed);
    setCustom("");
    setOpen(false);
  }

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-[#1a2d50] bg-[#040d24] px-2.5 py-1 text-xs text-slate-300 transition hover:border-amber-500/40 hover:text-amber-300"
      >
        <span className="text-slate-500">{me ? "You:" : "Who are you?"}</span>
        {me && <span className="font-semibold text-amber-300">{me}</span>}
        <span className="text-[9px] text-slate-600">▼</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className={`absolute z-20 mt-1 ${
              compact ? "right-0" : "left-0"
            } w-56 rounded-xl border border-[#1a2d50] bg-[#060f2a] p-2 shadow-xl`}
          >
            <p className="px-1 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Pick your name
            </p>
            <div className="grid grid-cols-2 gap-1">
              {PLAYERS.map((p) => (
                <button
                  key={p}
                  onClick={() => choose(p)}
                  className={`rounded-md px-2 py-1 text-left text-xs transition hover:bg-[#0a1535] ${
                    me === p ? "bg-amber-500/15 text-amber-300" : "text-slate-300"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                choose(custom);
              }}
              className="mt-2 flex gap-1"
            >
              <input
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                placeholder="Other…"
                maxLength={MAX_AUTHOR_LENGTH}
                className="min-w-0 flex-1 rounded-md border border-[#1a2d50] bg-[#040d24] px-2 py-1 text-base text-slate-100 placeholder:text-slate-600 focus:border-amber-500/50 focus:outline-none sm:text-xs"
              />
              <button
                type="submit"
                className="rounded-md bg-amber-500 px-2 py-1 text-xs font-bold text-slate-950 transition hover:bg-amber-400"
              >
                Set
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
