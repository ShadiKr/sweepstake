/** Tiny SVG polyline chart for showing points progression. No dependencies. */
export function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null;

  const W = 120, H = 32, PAD = 2;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = values
    .map((v, i) => {
      const x = PAD + (i / (values.length - 1)) * (W - PAD * 2);
      const y = PAD + (1 - (v - min) / range) * (H - PAD * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      aria-hidden
      className="shrink-0 overflow-visible"
    >
      <polyline
        points={points}
        fill="none"
        stroke="rgb(251 191 36)"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
