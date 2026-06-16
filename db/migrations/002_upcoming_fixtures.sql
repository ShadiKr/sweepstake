-- Add upcoming_fixtures column to sync_state so the sync can cache scheduled
-- matches for the "Coming Up" sidebar. Safe to re-run (idempotent).
alter table sync_state add column if not exists upcoming_fixtures jsonb;
