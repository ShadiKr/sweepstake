import { PLAYERS } from "@/lib/teams";
import type { Player } from "@/lib/types";

/** Distinct line colors per player, readable on the dark navy background. */
const COLORS: Record<Player, string> = {
  Shadi: "#fbbf24", // amber
  Leon: "#38bdf8", // sky
  Cole: "#34d399", // emerald
  Fergus: "#fb7185", // rose
  Josh: "#a78bfa", // violet
  Yaro: "#f97316", // orange
  Connor: "#2dd4bf", // teal
  Emanuele: "#f472b6", // pink
};

export function PointsChart({
  timelines,
}: {
  timelines: Record<Player, number[]>;
}) {
  const length = timelines[PLAYERS[0]]?.length ?? 0;
  const matchCount = length - 1;

  if (matchCount < 1) {
    return (
      <p className="rounded-xl border border-dashed border-[#1a2d50] px-4 py-12 text-center text-sm text-slate-600">
        No matches yet — the chart will plot each player&apos;s points as results come in.
      </p>
    );
  }

  const W = 720, H = 360;
  const PAD_L = 32, PAD_R = 12, PAD_T = 16, PAD_B = 28;
  const plotW = W - PAD_L - PAD_R;
  const plotH = H - PAD_T - PAD_B;

  const maxPoints = Math.max(
    1,
    ...PLAYERS.flatMap((p) => timelines[p] ?? [0]),
  );

  // Round the y-axis ceiling up to a clean step.
  const yStep = maxPoints <= 6 ? 1 : maxPoints <= 15 ? 3 : 5;
  const yMax = Math.ceil(maxPoints / yStep) * yStep;

  const x = (i: number) => PAD_L + (matchCount === 0 ? 0 : (i / matchCount) * plotW);
  const y = (v: number) => PAD_T + (1 - v / yMax) * plotH;

  const yTicks: number[] = [];
  for (let v = 0; v <= yMax; v += yStep) yTicks.push(v);

  // Players sorted by final points so the legend reads like the leaderboard.
  const ranked = [...PLAYERS].sort(
    (a, b) => (timelines[b].at(-1) ?? 0) - (timelines[a].at(-1) ?? 0),
  );

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-[#1a2d50] bg-[#040d24] p-3">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Points over time">
          {/* Y gridlines + labels */}
          {yTicks.map((v) => (
            <g key={v}>
              <line
                x1={PAD_L}
                x2={W - PAD_R}
                y1={y(v)}
                y2={y(v)}
                stroke="#1a2d50"
                strokeWidth="1"
              />
              <text
                x={PAD_L - 6}
                y={y(v) + 3}
                textAnchor="end"
                className="fill-slate-600"
                fontSize="10"
              >
                {v}
              </text>
            </g>
          ))}

          {/* X axis label */}
          <text
            x={PAD_L + plotW / 2}
            y={H - 4}
            textAnchor="middle"
            className="fill-slate-600"
            fontSize="10"
          >
            matches played →
          </text>

          {/* Player lines */}
          {PLAYERS.map((p) => {
            const series = timelines[p];
            const points = series
              .map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`)
              .join(" ");
            return (
              <polyline
                key={p}
                points={points}
                fill="none"
                stroke={COLORS[p]}
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
                opacity="0.9"
              />
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <ul className="flex flex-wrap gap-x-5 gap-y-2">
        {ranked.map((p) => (
          <li key={p} className="flex items-center gap-2 text-sm">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: COLORS[p] }}
            />
            <span className="text-slate-300">{p}</span>
            <span className="font-bold text-amber-400">{timelines[p].at(-1) ?? 0}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
