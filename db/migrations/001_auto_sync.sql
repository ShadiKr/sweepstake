-- Migration for the automatic score sync feature.
-- Run this once against your EXISTING Neon database (it's safe to re-run —
-- every statement is idempotent). New databases created from schema.sql
-- already include these and don't need this file.

alter table matches add column if not exists external_id text;
alter table matches add column if not exists source text not null default 'manual';
alter table matches add column if not exists locked boolean not null default false;

-- Unique external_id so the sync can upsert on it (partial: only synced rows).
create unique index if not exists matches_external_id_key
  on matches (external_id)
  where external_id is not null;

create table if not exists sync_state (
  id             integer primary key default 1,
  last_synced_at timestamptz
);
insert into sync_state (id) values (1) on conflict do nothing;
