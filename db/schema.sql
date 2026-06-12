-- World Cup Sweepstake — database schema.
-- Run this once against your Neon database (Neon SQL editor, or:
--   psql "$DATABASE_URL" -f db/schema.sql
-- ). The only mutable data in the app is the list of matches; players, teams,
-- and the draw (who owns which team) live in code (src/lib/teams.ts).

create table if not exists matches (
  id          serial primary key,
  home_team   text        not null,
  away_team   text        not null,
  home_score  integer     not null,
  away_score  integer     not null,
  stage       text,                 -- optional label, e.g. "Group A", "Round of 16", "Final"
  pen_winner  text,                 -- optional: team that advanced if a knockout draw went to penalties
  created_at  timestamptz not null default now()
);
