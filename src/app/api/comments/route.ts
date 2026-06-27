import { NextResponse } from "next/server";
import { addComment, listComments } from "@/lib/social-store";
import { commentSchema } from "@/lib/social";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const comments = await listComments(100);
  return NextResponse.json(comments);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = commentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid comment" },
      { status: 400 },
    );
  }
  const comment = await addComment(parsed.data);
  return NextResponse.json(comment, { status: 201 });
}
