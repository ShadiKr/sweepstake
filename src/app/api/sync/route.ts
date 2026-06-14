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

/** Force a sync now (used by the "Sync now" button and any cron job). */
export async function POST() {
  const result = await syncMatches({ force: true });
  return NextResponse.json(result);
}
