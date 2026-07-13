-- Fasting timer storage for tracker.html.
-- Run once in the HealthData project's Supabase SQL editor.
-- A fast with ended_at NULL is the active (running) fast; ending it stamps ended_at.

create table if not exists public.fasts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  started_at timestamptz not null,
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  constraint fast_ends_after_start check (ended_at is null or ended_at > started_at)
);

-- Only one running fast per user.
create unique index if not exists one_active_fast_per_user
  on public.fasts (user_id) where ended_at is null;

alter table public.fasts enable row level security;

create policy "Users manage their own fasts"
  on public.fasts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
