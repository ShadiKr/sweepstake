import { after, NextResponse } from "next/server";
import { createMatch, listMatches } from "@/lib/matches-store";
import { syncMatches } from "@/lib/sync";
import { matchSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const matches = await listMatches();
  // Opportunistically refresh from the API after responding (throttled inside
  // syncMatches), so simply viewing the page keeps scores up to date without
  // adding latency to this request. No-op if FOOTBALL_DATA_TOKEN isn't set.
  after(async () => {
    try {
      await syncMatches();
    } catch {
      /* never let a sync failure affect the response */
    }
  });
  return NextResponse.json(matches);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = matchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid match" },
      { status: 400 },
    );
  }
  const match = await createMatch(parsed.data);
  return NextResponse.json(match, { status: 201 });
}
