import { NextResponse } from "next/server";
import { createMatch, listMatches } from "@/lib/matches-store";
import { matchSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const matches = await listMatches();
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
