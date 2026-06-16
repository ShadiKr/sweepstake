import { neon } from "@neondatabase/serverless";
import { promises as fs } from "fs";
import path from "path";
import type { Match, UpcomingFixture } from "./types";
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

// On Vercel (and any production environment) the filesystem is read-only, so
// the local JSON fallback won't work. Guard at request time (not module load,
// which would break `next build`) with a helpful message instead of a cryptic
// ENOENT crash.
function ensureWritableStore(): void {
  if (!usingDatabase && process.env.NODE_ENV === "production") {
    throw new Error(
      "DATABASE_URL is not set. Connect a Neon database in your Vercel project under Storage → Create Database.",
    );
  }
}

/** A fixture coming from the auto-sync (football-data.org). */
export interface ExternalMatch {
  external_id: string;
  home_team: string;
  away_team: string;
  home_score: number;
  away_score: number;
  stage: string | null;
  pen_winner: string | null;
}

export type UpsertOutcome = "inserted" | "updated" | "skipped";

function normalize(
  input: MatchInput,
): Omit<Match, "id" | "created_at" | "external_id" | "source" | "locked"> {
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
    insert into matches (home_team, away_team, home_score, away_score, stage, pen_winner, source)
    values (${m.home_team}, ${m.away_team}, ${m.home_score}, ${m.away_score}, ${m.stage}, ${m.pen_winner}, 'manual')
    returning *`;
  return rows[0] as Match;
}

async function neonUpdate(id: number, input: MatchInput): Promise<Match | null> {
  const m = normalize(input);
  const sql = getSql();
  // A hand edit locks the row so the auto-sync won't overwrite it afterwards.
  const rows = await sql`
    update matches set
      home_team = ${m.home_team},
      away_team = ${m.away_team},
      home_score = ${m.home_score},
      away_score = ${m.away_score},
      stage = ${m.stage},
      pen_winner = ${m.pen_winner},
      locked = true
    where id = ${id}
    returning *`;
  return (rows[0] as Match) ?? null;
}

async function neonDelete(id: number): Promise<boolean> {
  const sql = getSql();
  const rows = await sql`delete from matches where id = ${id} returning id`;
  return rows.length > 0;
}

async function neonUpsertExternal(m: ExternalMatch): Promise<UpsertOutcome> {
  const sql = getSql();
  // Upsert on external_id; never overwrite a locked (manually overridden) row.
  // `xmax = 0` is true only for freshly inserted rows.
  const rows = await sql`
    insert into matches (external_id, home_team, away_team, home_score, away_score, stage, pen_winner, source)
    values (${m.external_id}, ${m.home_team}, ${m.away_team}, ${m.home_score}, ${m.away_score}, ${m.stage}, ${m.pen_winner}, 'auto')
    on conflict (external_id) where external_id is not null do update set
      home_team = excluded.home_team,
      away_team = excluded.away_team,
      home_score = excluded.home_score,
      away_score = excluded.away_score,
      stage = excluded.stage,
      pen_winner = excluded.pen_winner
    where matches.locked = false
    returning (xmax = 0) as inserted`;
  if (rows.length === 0) return "skipped";
  return (rows[0] as { inserted: boolean }).inserted ? "inserted" : "updated";
}

async function neonGetLastSyncedAt(): Promise<string | null> {
  const sql = getSql();
  const rows = await sql`select last_synced_at from sync_state where id = 1`;
  return (rows[0]?.last_synced_at as string | null) ?? null;
}

async function neonSetLastSyncedAt(iso: string): Promise<void> {
  const sql = getSql();
  await sql`
    insert into sync_state (id, last_synced_at) values (1, ${iso})
    on conflict (id) do update set last_synced_at = excluded.last_synced_at`;
}

async function neonGetUpcomingFixtures(): Promise<UpcomingFixture[]> {
  const sql = getSql();
  const rows = await sql`select upcoming_fixtures from sync_state where id = 1`;
  const val = rows[0]?.upcoming_fixtures;
  if (!val) return [];
  return val as UpcomingFixture[];
}

async function neonSetUpcomingFixtures(fixtures: UpcomingFixture[]): Promise<void> {
  const sql = getSql();
  await sql`
    update sync_state set upcoming_fixtures = ${JSON.stringify(fixtures)}::jsonb
    where id = 1`;
}

// ---------------------------------------------------------------------------
// Local JSON file fallback (development only)
// ---------------------------------------------------------------------------

const DATA_FILE = path.join(process.cwd(), ".data", "matches.json");

async function fileReadAll(): Promise<Match[]> {
  ensureWritableStore();
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(raw) as Match[];
  } catch {
    return [];
  }
}

async function fileWriteAll(matches: Match[]): Promise<void> {
  ensureWritableStore();
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
  const match: Match = {
    id,
    created_at: new Date().toISOString(),
    external_id: null,
    source: "manual",
    locked: false,
    ...normalize(input),
  };
  all.push(match);
  await fileWriteAll(all);
  return match;
}

async function fileUpdate(id: number, input: MatchInput): Promise<Match | null> {
  const all = await fileReadAll();
  const index = all.findIndex((m) => m.id === id);
  if (index === -1) return null;
  all[index] = { ...all[index], ...normalize(input), locked: true };
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

async function fileUpsertExternal(m: ExternalMatch): Promise<UpsertOutcome> {
  const all = await fileReadAll();
  const existing = all.find((row) => row.external_id === m.external_id);
  if (existing) {
    if (existing.locked) return "skipped";
    Object.assign(existing, {
      home_team: m.home_team,
      away_team: m.away_team,
      home_score: m.home_score,
      away_score: m.away_score,
      stage: m.stage,
      pen_winner: m.pen_winner,
    });
    await fileWriteAll(all);
    return "updated";
  }
  const id = all.reduce((max, row) => Math.max(max, row.id), 0) + 1;
  all.push({
    id,
    created_at: new Date().toISOString(),
    source: "auto",
    locked: false,
    ...m,
  });
  await fileWriteAll(all);
  return "inserted";
}

const SYNC_FILE = path.join(process.cwd(), ".data", "sync.json");

type SyncFileData = { last_synced_at?: string | null; upcoming_fixtures?: UpcomingFixture[] };

async function readSyncFile(): Promise<SyncFileData> {
  try {
    const raw = await fs.readFile(SYNC_FILE, "utf8");
    return JSON.parse(raw) as SyncFileData;
  } catch {
    return {};
  }
}

async function writeSyncFile(data: SyncFileData): Promise<void> {
  ensureWritableStore();
  await fs.mkdir(path.dirname(SYNC_FILE), { recursive: true });
  await fs.writeFile(SYNC_FILE, JSON.stringify(data), "utf8");
}

async function fileGetLastSyncedAt(): Promise<string | null> {
  ensureWritableStore();
  return (await readSyncFile()).last_synced_at ?? null;
}

async function fileSetLastSyncedAt(iso: string): Promise<void> {
  await writeSyncFile({ ...(await readSyncFile()), last_synced_at: iso });
}

async function fileGetUpcomingFixtures(): Promise<UpcomingFixture[]> {
  ensureWritableStore();
  return (await readSyncFile()).upcoming_fixtures ?? [];
}

async function fileSetUpcomingFixtures(fixtures: UpcomingFixture[]): Promise<void> {
  await writeSyncFile({ ...(await readSyncFile()), upcoming_fixtures: fixtures });
}

// ---------------------------------------------------------------------------
// Public API — picks the implementation based on DATABASE_URL
// ---------------------------------------------------------------------------

export const listMatches = usingDatabase ? neonList : fileList;
export const createMatch = usingDatabase ? neonCreate : fileCreate;
export const updateMatch = usingDatabase ? neonUpdate : fileUpdate;
export const deleteMatch = usingDatabase ? neonDelete : fileDelete;
export const upsertExternalMatch = usingDatabase ? neonUpsertExternal : fileUpsertExternal;
export const getLastSyncedAt = usingDatabase ? neonGetLastSyncedAt : fileGetLastSyncedAt;
export const setLastSyncedAt = usingDatabase ? neonSetLastSyncedAt : fileSetLastSyncedAt;
export const getUpcomingFixtures = usingDatabase ? neonGetUpcomingFixtures : fileGetUpcomingFixtures;
export const setUpcomingFixtures = usingDatabase ? neonSetUpcomingFixtures : fileSetUpcomingFixtures;
