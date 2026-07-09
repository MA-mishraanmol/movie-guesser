-- Run this once in your Supabase project's SQL editor (Dashboard > SQL Editor > New query).
-- Safe to re-run: drops and recreates the three multiplayer tables.

drop table if exists answers;
drop table if exists players;
drop table if exists rooms;

create table rooms (
  code text primary key,
  host_player_id uuid,
  status text not null default 'lobby',          -- lobby | playing | round_result | game_over
  movie_queue integer[] not null default '{}',
  round_index integer not null default 0,
  tier_index integer not null default 0,          -- 0 = hard, 1 = medium, 2 = easy
  tier_deadline timestamptz,
  created_at timestamptz not null default now()
);

create table players (
  id uuid primary key default gen_random_uuid(),
  room_code text references rooms(code) on delete cascade,
  nickname text not null,
  color_index integer not null default 0,
  score integer not null default 0,
  streak integer not null default 0,
  connected boolean not null default true,
  joined_at timestamptz not null default now()
);

create table answers (
  id uuid primary key default gen_random_uuid(),
  room_code text references rooms(code) on delete cascade,
  round_index integer not null,
  player_id uuid references players(id) on delete cascade,
  guess text,
  correct boolean not null default false,
  tier_answered integer,
  points integer not null default 0,
  answered_at timestamptz default now(),
  unique (room_code, round_index, player_id)
);

alter table rooms enable row level security;
alter table players enable row level security;
alter table answers enable row level security;

-- Permissive policies: this is a no-login party game (like Kahoot/Psych), nothing sensitive
-- is stored, and the anon key is meant to be exposed client-side. Security comes from the
-- fact that room codes are the only way to address a room.
create policy "public read/write rooms" on rooms for all using (true) with check (true);
create policy "public read/write players" on players for all using (true) with check (true);
create policy "public read/write answers" on answers for all using (true) with check (true);

-- Enable Realtime for these tables (Dashboard > Database > Replication, or via SQL):
alter publication supabase_realtime add table rooms;
alter publication supabase_realtime add table players;
alter publication supabase_realtime add table answers;
