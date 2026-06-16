-- Store each match's real kickoff time so the points chart can group results
-- by matchday (synced rows otherwise share a created_at from sync time).
-- Backfilled from the API on the next sync. Safe to re-run (idempotent).
alter table matches add column if not exists played_at timestamptz;
