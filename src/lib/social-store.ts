import { neon } from "@neondatabase/serverless";
import { promises as fs } from "fs";
import path from "path";
import type { Comment, Reaction } from "./types";

/**
 * Data access for the social layer: emoji reactions on matches and the Banter
 * comment wall. Same dual-store approach as matches-store: Neon when
 * DATABASE_URL is set, a local JSON file otherwise (development only).
 */

const DATABASE_URL = process.env.DATABASE_URL;
const usingDatabase = Boolean(DATABASE_URL);

function ensureWritableStore(): void {
  if (!usingDatabase && process.env.NODE_ENV === "production") {
    throw new Error(
      "DATABASE_URL is not set. Connect a Neon database in your Vercel project under Storage → Create Database.",
    );
  }
}

export interface ReactionInput {
  matchId: number;
  emoji: string;
  author: string;
}

export interface CommentInput {
  author: string;
  body: string;
}

// ---------------------------------------------------------------------------
// Neon (Postgres) implementation
// ---------------------------------------------------------------------------

function getSql() {
  return neon(DATABASE_URL!);
}

async function neonListReactions(): Promise<Reaction[]> {
  const sql = getSql();
  const rows = await sql`select * from reactions order by id asc`;
  return rows as Reaction[];
}

/** Toggle a reaction: remove it if this author already left it, else add it. */
async function neonToggleReaction(input: ReactionInput): Promise<void> {
  const sql = getSql();
  const deleted = await sql`
    delete from reactions
    where match_id = ${input.matchId} and emoji = ${input.emoji} and author = ${input.author}
    returning id`;
  if (deleted.length > 0) return;
  await sql`
    insert into reactions (match_id, emoji, author)
    values (${input.matchId}, ${input.emoji}, ${input.author})
    on conflict (match_id, emoji, author) do nothing`;
}

async function neonListComments(limit: number): Promise<Comment[]> {
  const sql = getSql();
  const rows = await sql`select * from comments order by id desc limit ${limit}`;
  return rows as Comment[];
}

async function neonAddComment(input: CommentInput): Promise<Comment> {
  const sql = getSql();
  const rows = await sql`
    insert into comments (author, body) values (${input.author}, ${input.body})
    returning *`;
  return rows[0] as Comment;
}

// ---------------------------------------------------------------------------
// Local JSON file fallback (development only)
// ---------------------------------------------------------------------------

const DATA_FILE = path.join(process.cwd(), ".data", "social.json");

type SocialFileData = {
  reactions: Reaction[];
  comments: Comment[];
  nextReactionId: number;
  nextCommentId: number;
};

async function readFile(): Promise<SocialFileData> {
  ensureWritableStore();
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const data = JSON.parse(raw) as Partial<SocialFileData>;
    return {
      reactions: data.reactions ?? [],
      comments: data.comments ?? [],
      nextReactionId: data.nextReactionId ?? 1,
      nextCommentId: data.nextCommentId ?? 1,
    };
  } catch {
    return { reactions: [], comments: [], nextReactionId: 1, nextCommentId: 1 };
  }
}

async function writeFile(data: SocialFileData): Promise<void> {
  ensureWritableStore();
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

async function fileListReactions(): Promise<Reaction[]> {
  return (await readFile()).reactions;
}

async function fileToggleReaction(input: ReactionInput): Promise<void> {
  const data = await readFile();
  const idx = data.reactions.findIndex(
    (r) => r.match_id === input.matchId && r.emoji === input.emoji && r.author === input.author,
  );
  if (idx !== -1) {
    data.reactions.splice(idx, 1);
  } else {
    data.reactions.push({
      id: data.nextReactionId++,
      match_id: input.matchId,
      emoji: input.emoji,
      author: input.author,
      created_at: new Date().toISOString(),
    });
  }
  await writeFile(data);
}

async function fileListComments(limit: number): Promise<Comment[]> {
  const data = await readFile();
  return [...data.comments].sort((a, b) => b.id - a.id).slice(0, limit);
}

async function fileAddComment(input: CommentInput): Promise<Comment> {
  const data = await readFile();
  const comment: Comment = {
    id: data.nextCommentId++,
    author: input.author,
    body: input.body,
    created_at: new Date().toISOString(),
  };
  data.comments.push(comment);
  await writeFile(data);
  return comment;
}

// ---------------------------------------------------------------------------
// Public API — picks the implementation based on DATABASE_URL
// ---------------------------------------------------------------------------

export const listReactions = usingDatabase ? neonListReactions : fileListReactions;
export const toggleReaction = usingDatabase ? neonToggleReaction : fileToggleReaction;
export const listComments = usingDatabase ? neonListComments : fileListComments;
export const addComment = usingDatabase ? neonAddComment : fileAddComment;
