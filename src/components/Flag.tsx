import { TEAM_CODE } from "@/lib/flags";

/**
 * Renders a team's flag as an SVG (via the flag-icons CSS). Size follows the
 * surrounding font-size; pass a text-size class to scale it. Falls back to a
 * neutral placeholder if a team has no mapped code.
 */
export function Flag({ team, className = "" }: { team: string; className?: string }) {
  const code = TEAM_CODE[team];
  if (!code) {
    return (
      <span
        aria-hidden
        className={`inline-block h-[0.85em] w-[1.2em] shrink-0 rounded-[2px] bg-slate-700 ${className}`}
      />
    );
  }
  return (
    <span
      aria-hidden
      className={`fi fi-${code} shrink-0 rounded-[2px] shadow-sm ${className}`}
      style={{ lineHeight: "1em" }}
    />
  );
}
