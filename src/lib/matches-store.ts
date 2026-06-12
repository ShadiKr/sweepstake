import { neon } from "@neondatabase/serverless";
import { promises as fs } from "fs";
import path from "path";
import type { Match } from "./types";
import type { MatchInput } from "./validation";

/**
 * Data access for matches — the only mutable data in the app.
 *
 * If DATABASE_URL is set, all reads/writes go to Neon Postgres (shared, live
 * data for everyone). If it is NOT set, we fall back to a local JSON file so
 * the app runs with zero setup during development. The local file is not used
 * in production on Vercel (its filesystem is read-only), so a database is
 * required for the deployed, shared version.
 */

const DATABASE_URL = process.env.DATABASE_URL;
export const usingDatabase = Boolean(DATABASE_URL);

function normalize(input: MatchInput): Omit<Match, "id" | "created_at"> {
  return {
    home_team: input.home_team,
    away_team: input.away_team,
    home_score: input.home_score,
    away_score: input.away_score,
    stage: input.stage ?? null,
    pen_winner: input.pen_winner ?? null,
  };
}

// ---------------------------------------------------------------------------
// Neon (Postgres) implementation
// ---------------------------------------------------------------------------

function getSql() {
  return neon(DATABASE_URL!);
}

async function neonList(): Promise<Match[]> {
  const sql = getSql();
  const rows = await sql`select * from matches order by created_at desc, id desc`;
  return rows as Match[];
}

async function neonCreate(input: MatchInput): Promise<Match> {
  const m = normalize(input);
  const sql = getSql();
  const rows = await sql`
    insert into matches (home_team, away_team, home_score, away_score, stage, pen_winner)
    values (${m.home_team}, ${m.away_team}, ${m.home_score}, ${m.away_score}, ${m.stage}, ${m.pen_winner})
    returning *`;
  return rows[0] as Match;
}

async function neonUpdate(id: number, input: MatchInput): Promise<Match | null> {
  const m = normalize(input);
  const sql = getSql();
  const rows = await sql`
    update matches set
      home_team = ${m.home_team},
      away_team = ${m.away_team},
      home_score = ${m.home_score},
      away_score = ${m.away_score},
      stage = ${m.stage},
      pen_winner = ${m.pen_winner}
    where id = ${id}
    returning *`;
  return (rows[0] as Match) ?? null;
}

async function neonDelete(id: number): Promise<boolean> {
  const sql = getSql();
  const rows = await sql`delete from matches where id = ${id} returning id`;
  return rows.length > 0;
}

// ---------------------------------------------------------------------------
// Local JSON file fallback (development only)
// ---------------------------------------------------------------------------

const DATA_FILE = path.join(process.cwd(), ".data", "matches.json");

async function fileReadAll(): Promise<Match[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(raw) as Match[];
  } catch {
    return [];
  }
}

async function fileWriteAll(matches: Match[]): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(matches, null, 2), "utf8");
}

async function fileList(): Promise<Match[]> {
  const all = await fileReadAll();
  return all.sort((a, b) => b.created_at.localeCompare(a.created_at) || b.id - a.id);
}

async function fileCreate(input: MatchInput): Promise<Match> {
  const all = await fileReadAll();
  const id = all.reduce((max, m) => Math.max(max, m.id), 0) + 1;
  const match: Match = { id, created_at: new Date().toISOString(), ...normalize(input) };
  all.push(match);
  await fileWriteAll(all);
  return match;
}

async function fileUpdate(id: number, input: MatchInput): Promise<Match | null> {
  const all = await fileReadAll();
  const index = all.findIndex((m) => m.id === id);
  if (index === -1) return null;
  all[index] = { ...all[index], ...normalize(input) };
  await fileWriteAll(all);
  return all[index];
}

async function fileDelete(id: number): Promise<boolean> {
  const all = await fileReadAll();
  const next = all.filter((m) => m.id !== id);
  if (next.length === all.length) return false;
  await fileWriteAll(next);
  return true;
}

// ---------------------------------------------------------------------------
// Public API — picks the implementation based on DATABASE_URL
// ---------------------------------------------------------------------------

export const listMatches = usingDatabase ? neonList : fileList;
export const createMatch = usingDatabase ? neonCreate : fileCreate;
export const updateMatch = usingDatabase ? neonUpdate : fileUpdate;
export const deleteMatch = usingDatabase ? neonDelete : fileDelete;
