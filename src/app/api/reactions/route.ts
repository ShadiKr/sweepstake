import { NextResponse } from "next/server";
import { listReactions, toggleReaction } from "@/lib/social-store";
import { reactionSchema } from "@/lib/social";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const reactions = await listReactions();
  return NextResponse.json(reactions);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = reactionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid reaction" },
      { status: 400 },
    );
  }
  await toggleReaction(parsed.data);
  const reactions = await listReactions();
  return NextResponse.json(reactions);
}
