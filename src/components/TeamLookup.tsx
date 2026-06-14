"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { TEAMS, TEAM_OWNER } from "@/lib/teams";
import { Flag } from "./Flag";

/**
 * A searchable flag dropdown: pick any of the 48 teams and instantly see which
 * player drew it. Static data, so it works regardless of the match feed.
 */
export function TeamLookup() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return TEAMS;
    return TEAMS.filter((t) => t.toLowerCase().includes(q));
  }, [query]);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  // Focus the search box when opening.
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function choose(team: string) {
    setSelected(team);
    setOpen(false);
    setQuery("");
  }

  const owner = selected ? TEAM_OWNER[selected] : null;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[#1a2d50] bg-[#060f2a] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400/80">
          Who&apos;s got…
        </span>

        <div ref={rootRef} className="relative">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex min-w-[11rem] items-center justify-between gap-2 rounded-lg border border-[#1a2d50] bg-[#040d24] px-3 py-1.5 text-sm text-slate-200 transition hover:border-amber-500/40"
          >
            <span className="flex items-center gap-2 truncate">
              {selected ? (
                <>
                  <Flag team={selected} className="text-sm" />
                  <span className="truncate">{selected}</span>
                </>
              ) : (
                <span className="text-slate-500">Pick a country</span>
              )}
            </span>
            <span
              className={`text-[10px] text-slate-500 transition-transform ${open ? "rotate-180" : ""}`}
            >
              ▼
            </span>
          </button>

          {open && (
            <div className="absolute left-0 top-full z-20 mt-1 w-64 overflow-hidden rounded-lg border border-[#1a2d50] bg-[#040d24] shadow-xl shadow-black/40">
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search…"
                className="w-full border-b border-[#1a2d50] bg-[#02071a] px-3 py-2 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-amber-500/40"
              />
              <ul className="max-h-64 overflow-y-auto py-1">
                {filtered.length === 0 ? (
                  <li className="px-3 py-2 text-xs text-slate-600">No teams match.</li>
                ) : (
                  filtered.map((team) => (
                    <li key={team}>
                      <button
                        type="button"
                        onClick={() => choose(team)}
                        className={`flex w-full items-center justify-between gap-2 px-3 py-1.5 text-left text-sm transition hover:bg-[#071130] ${
                          team === selected ? "text-amber-300" : "text-slate-300"
                        }`}
                      >
                        <span className="flex items-center gap-2 truncate">
                          <Flag team={team} className="text-sm" />
                          <span className="truncate">{team}</span>
                        </span>
                        <span className="shrink-0 text-[10px] text-slate-600">
                          {TEAM_OWNER[team]}
                        </span>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>
      </div>

      <p className="text-sm text-slate-400">
        {owner ? (
          <>
            <Flag team={selected!} className="mr-1.5 text-sm" />
            <span className="text-slate-300">{selected}</span> belongs to{" "}
            <span className="font-bold text-amber-400">{owner}</span>
          </>
        ) : (
          <span className="text-slate-600">Select a country to see who drew it.</span>
        )}
      </p>
    </div>
  );
}
