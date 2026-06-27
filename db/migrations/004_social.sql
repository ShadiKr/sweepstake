-- Social layer: emoji reactions on match results + a Banter comment wall.
-- Idempotent; run once in the Neon SQL editor.

create table if not exists reactions (
  id          serial primary key,
  match_id    integer not null references matches(id) on delete cascade,
  emoji       text not null,
  author      text not null,
  created_at  timestamptz not null default now(),
  unique (match_id, emoji, author)
);

create table if not exists comments (
  id          serial primary key,
  author      text not null,
  body        text not null,
  created_at  timestamptz not null default now()
);
