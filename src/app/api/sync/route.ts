import { NextResponse } from "next/server";
import { getLastSyncedAt } from "@/lib/matches-store";
import { syncMatches } from "@/lib/sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Status only — when the auto-sync last ran. */
export async function GET() {
  const lastSyncedAt = await getLastSyncedAt();
  return NextResponse.json({
    lastSyncedAt,
    configured: Boolean(process.env.FOOTBALL_DATA_TOKEN),
  });
}

/**
 * Run a sync. The client triggers this on every page load (both pages) so
 * scores stay fresh. `?force=1` (the "Sync now" button) bypasses the throttle;
 * the automatic heartbeat omits it and is throttled inside syncMatches.
 */
export async function POST(req: Request) {
  const force = new URL(req.url).searchParams.get("force") === "1";
  const result = await syncMatches({ force });
  return NextResponse.json(result);
}
