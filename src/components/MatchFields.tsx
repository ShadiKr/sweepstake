"use client";

import { TEAMS } from "@/lib/teams";

export interface MatchFormValue {
  home_team: string;
  away_team: string;
  home_score: string;
  away_score: string;
  stage: string;
  pen_winner: string;
}

export const emptyMatch: MatchFormValue = {
  home_team: "",
  away_team: "",
  home_score: "",
  away_score: "",
  stage: "",
  pen_winner: "",
};

/** Convert a form value into the JSON body the API expects, or null if invalid. */
export function toMatchBody(v: MatchFormValue) {
  const home = Number(v.home_score);
  const away = Number(v.away_score);
  if (!v.home_team || !v.away_team) return null;
  if (v.home_score === "" || v.away_score === "") return null;
  if (!Number.isInteger(home) || !Number.isInteger(away)) return null;
  const isDraw = home === away;
  return {
    home_team: v.home_team,
    away_team: v.away_team,
    home_score: home,
    away_score: away,
    stage: v.stage.trim() || null,
    pen_winner: isDraw && v.pen_winner ? v.pen_winner : null,
  };
}

const inputClass =
  "rounded-lg border border-[#1a2d50] bg-[#02071a] px-3 py-2 text-sm text-slate-100 focus:border-amber-500/60 focus:outline-none";

export function MatchFields({
  value,
  onChange,
}: {
  value: MatchFormValue;
  onChange: (next: MatchFormValue) => void;
}) {
  const set = (patch: Partial<MatchFormValue>) => onChange({ ...value, ...patch });
  const isDraw =
    value.home_score !== "" &&
    value.away_score !== "" &&
    Number(value.home_score) === Number(value.away_score);
  const bothTeams = value.home_team && value.away_team;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <select
          aria-label="Home team"
          className={inputClass}
          value={value.home_team}
          onChange={(e) => set({ home_team: e.target.value })}
        >
          <option value="">Home team…</option>
          {TEAMS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <span className="text-xs text-slate-500">vs</span>
        <select
          aria-label="Away team"
          className={inputClass}
          value={value.away_team}
          onChange={(e) => set({ away_team: e.target.value })}
        >
          <option value="">Away team…</option>
          {TEAMS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <input
          aria-label="Home score"
          type="number"
          min={0}
          inputMode="numeric"
          placeholder="0"
          className={`${inputClass} text-center`}
          value={value.home_score}
          onChange={(e) => set({ home_score: e.target.value })}
        />
        <span className="text-xs text-slate-500">–</span>
        <input
          aria-label="Away score"
          type="number"
          min={0}
          inputMode="numeric"
          placeholder="0"
          className={`${inputClass} text-center`}
          value={value.away_score}
          onChange={(e) => set({ away_score: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <input
          aria-label="Stage"
          type="text"
          placeholder="Stage (optional) e.g. Group A"
          className={inputClass}
          value={value.stage}
          onChange={(e) => set({ stage: e.target.value })}
        />
        {isDraw && bothTeams && (
          <select
            aria-label="Penalty shootout winner"
            className={inputClass}
            value={value.pen_winner}
            onChange={(e) => set({ pen_winner: e.target.value })}
          >
            <option value="">Penalties? (advanced — optional)</option>
            <option value={value.home_team}>{value.home_team} won on pens</option>
            <option value={value.away_team}>{value.away_team} won on pens</option>
          </select>
        )}
      </div>
      {isDraw && bothTeams && value.pen_winner && (
        <p className="text-xs text-slate-500">
          Note: a shootout doesn&apos;t change points (still a draw, 1 pt each) — it only records
          who advanced.
        </p>
      )}
    </div>
  );
}
