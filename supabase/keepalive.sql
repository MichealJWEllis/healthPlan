-- Keepalive: a real daily DB write so Supabase's free-tier inactivity pause never triggers.
-- Proven 2026-07-07: authenticated REST *reads* every 3 days did NOT count as activity —
-- the project paused anyway. Only a genuine write resets the inactivity clock reliably.
--
-- Run once in this project's Supabase SQL editor. The GitHub Action
-- (.github/workflows/keepalive.yml) calls keepalive_ping() daily.

create table if not exists public.keepalive (
  id integer primary key,
  pinged_at timestamptz not null default now()
);

insert into public.keepalive (id) values (1)
on conflict (id) do nothing;

-- RLS on with no policies: the table is unreachable through the API
-- except via the security-definer RPC below.
alter table public.keepalive enable row level security;

create or replace function public.keepalive_ping()
returns timestamptz
language sql
security definer
set search_path = public
as $$
  update public.keepalive set pinged_at = now() where id = 1 returning pinged_at;
$$;

revoke all on function public.keepalive_ping() from public;
grant execute on function public.keepalive_ping() to anon;
