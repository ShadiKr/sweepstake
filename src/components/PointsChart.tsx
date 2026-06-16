"use client";

import { useRef, useState } from "react";
import { PLAYERS } from "@/lib/teams";
import type { Player, PointsTimeline } from "@/lib/types";

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

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
}

export function PointsChart({ timeline }: { timeline: PointsTimeline }) {
  const { labels, series } = timeline;
  const matchCount = labels.length;
  const [hoverI, setHoverI] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  if (matchCount < 1) {
    return (
      <p className="rounded-xl border border-dashed border-[#1a2d50] px-4 py-12 text-center text-sm text-slate-600">
        No matches yet — the chart will plot each player&apos;s points by matchday as results come in.
      </p>
    );
  }

  const W = 720, H = 360;
  const PAD_L = 32, PAD_R = 12, PAD_T = 16, PAD_B = 34;
  const plotW = W - PAD_L - PAD_R;
  const plotH = H - PAD_T - PAD_B;

  const maxPoints = Math.max(1, ...PLAYERS.flatMap((p) => series[p]));
  const yStep = maxPoints <= 6 ? 1 : maxPoints <= 15 ? 3 : 5;
  const yMax = Math.ceil(maxPoints / yStep) * yStep;

  const x = (i: number) => PAD_L + (i / matchCount) * plotW;
  const y = (v: number) => PAD_T + (1 - v / yMax) * plotH;

  const yTicks: number[] = [];
  for (let v = 0; v <= yMax; v += yStep) yTicks.push(v);

  // Thin the x-axis labels so they don't overlap.
  const labelStep = Math.ceil(matchCount / 8);

  const ranked = [...PLAYERS].sort(
    (a, b) => (series[b].at(-1) ?? 0) - (series[a].at(-1) ?? 0),
  );

  function handleMove(e: React.MouseEvent) {
    const rect = svgRef.current!.getBoundingClientRect();
    const xView = ((e.clientX - rect.left) / rect.width) * W;
    const i = Math.round(((xView - PAD_L) / plotW) * matchCount);
    setHoverI(Math.max(0, Math.min(matchCount, i)));
  }

  const tooltipLeft =
    hoverI != null ? Math.max(14, Math.min(86, (x(hoverI) / W) * 100)) : 0;

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-[#1a2d50] bg-[#040d24] p-3">
        <div className="relative">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            className="w-full touch-none"
            role="img"
            aria-label="Points by matchday"
            onMouseMove={handleMove}
            onMouseLeave={() => setHoverI(null)}
          >
            {/* Y gridlines + labels */}
            {yTicks.map((v) => (
              <g key={v}>
                <line x1={PAD_L} x2={W - PAD_R} y1={y(v)} y2={y(v)} stroke="#1a2d50" strokeWidth="1" />
                <text x={PAD_L - 6} y={y(v) + 3} textAnchor="end" className="fill-slate-600" fontSize="10">
                  {v}
                </text>
              </g>
            ))}

            {/* X-axis matchday labels */}
            {labels.map((label, k) =>
              k % labelStep === 0 || k === matchCount - 1 ? (
                <text
                  key={label + k}
                  x={x(k + 1)}
                  y={H - 18}
                  textAnchor="middle"
                  className="fill-slate-600"
                  fontSize="10"
                >
                  {formatDate(label)}
                </text>
              ) : null,
            )}
            <text x={PAD_L + plotW / 2} y={H - 4} textAnchor="middle" className="fill-slate-700" fontSize="9">
              matchday →
            </text>

            {/* Hover crosshair */}
            {hoverI != null && (
              <line x1={x(hoverI)} x2={x(hoverI)} y1={PAD_T} y2={PAD_T + plotH} stroke="#3b5b9a" strokeWidth="1" strokeDasharray="3 3" />
            )}

            {/* Player lines */}
            {PLAYERS.map((p) => (
              <polyline
                key={p}
                points={series[p].map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ")}
                fill="none"
                stroke={COLORS[p]}
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
                opacity={hoverI == null ? 0.9 : 0.55}
              />
            ))}

            {/* Hover dots */}
            {hoverI != null &&
              PLAYERS.map((p) => (
                <circle key={p} cx={x(hoverI)} cy={y(series[p][hoverI])} r="3" fill={COLORS[p]} />
              ))}
          </svg>

          {/* Hover tooltip */}
          {hoverI != null && (
            <div
              className="pointer-events-none absolute top-1 z-10 -translate-x-1/2 rounded-lg border border-[#1a2d50] bg-[#02071a]/95 px-3 py-2 shadow-xl shadow-black/50"
              style={{ left: `${tooltipLeft}%` }}
            >
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-amber-400/70">
                {hoverI === 0 ? "Start" : formatDate(labels[hoverI - 1])}
              </p>
              <ul className="space-y-0.5">
                {[...PLAYERS]
                  .sort((a, b) => series[b][hoverI] - series[a][hoverI])
                  .map((p) => (
                    <li key={p} className="flex items-center gap-2 text-xs whitespace-nowrap">
                      <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[p] }} />
                      <span className="text-slate-300">{p}</span>
                      <span className="ml-auto font-bold text-slate-100">{series[p][hoverI]}</span>
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <ul className="flex flex-wrap gap-x-5 gap-y-2">
        {ranked.map((p) => (
          <li key={p} className="flex items-center gap-2 text-sm">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[p] }} />
            <span className="text-slate-300">{p}</span>
            <span className="font-bold text-amber-400">{series[p].at(-1) ?? 0}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
