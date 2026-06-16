-- World Cup Sweepstake — database schema.
-- Run this once against your Neon database (Neon SQL editor, or:
--   psql "$DATABASE_URL" -f db/schema.sql
-- ). The mutable data is the list of matches; players, teams, and the draw
-- (who owns which team) live in code (src/lib/teams.ts).

create table if not exists matches (
  id          serial primary key,
  home_team   text        not null,
  away_team   text        not null,
  home_score  integer     not null,
  away_score  integer     not null,
  stage       text,                 -- optional label, e.g. "Group A", "Round of 16", "Final"
  pen_winner  text,                 -- optional: team that advanced if a knockout draw went to penalties
  external_id text unique,          -- football-data.org match id, when synced automatically
  source      text not null default 'manual',  -- 'auto' (synced) or 'manual' (entered by hand)
  locked      boolean not null default false,  -- a manual override the sync must not overwrite
  played_at   timestamptz,          -- real kickoff time (from the API), for grouping by matchday
  created_at  timestamptz not null default now()
);

-- Single-row table tracking when the auto-sync last ran (used to throttle it).
create table if not exists sync_state (
  id             integer primary key default 1,
  last_synced_at timestamptz
);
insert into sync_state (id) values (1) on conflict do nothing;
