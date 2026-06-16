import { NextResponse } from "next/server";
import { getUpcomingFixtures } from "@/lib/matches-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Returns the upcoming fixtures cached by the last sync run. */
export async function GET() {
  const fixtures = await getUpcomingFixtures();
  return NextResponse.json(fixtures);
}
