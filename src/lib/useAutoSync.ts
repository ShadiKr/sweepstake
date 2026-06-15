"use client";

import { useEffect } from "react";
import { useSWRConfig } from "swr";

/**
 * Triggers a score sync from the client — reliably, on every page that uses it
 * (both the leaderboard and the matches page). Fires once on mount and then on
 * an interval. The server throttles the actual football-data.org fetch, so a
 * heartbeat from several open tabs still hits the API at most once per window.
 *
 * This replaces the previous server-side `after()` background sync, which
 * didn't run reliably on Vercel's serverless functions.
 */
export function useAutoSync(intervalMs = 20000) {
  const { mutate } = useSWRConfig();

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        await fetch("/api/sync", { method: "POST" });
      } catch {
        /* offline or transient — try again next tick */
      }
      if (!cancelled) {
        mutate("/api/matches");
        mutate("/api/sync");
      }
    }

    run();
    const id = setInterval(run, intervalMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [intervalMs, mutate]);
}
