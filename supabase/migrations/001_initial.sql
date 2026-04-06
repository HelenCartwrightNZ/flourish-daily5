-- ============================================================
-- Flourish Daily 5 — Initial schema
-- Run this in the Supabase SQL Editor (or via supabase db push)
-- ============================================================

-- ── PROFILES ──────────────────────────────────────────────────
create table if not exists public.profiles (
  id        uuid references auth.users on delete cascade primary key,
  full_name text,
  email     text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- ── CHECK-INS ─────────────────────────────────────────────────
create table if not exists public.check_ins (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users on delete cascade not null,
  date       date not null,
  soul       boolean not null default false,
  roots      boolean not null default false,
  body       boolean not null default false,
  bank       boolean not null default false,
  brain      boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, date)
);

alter table public.check_ins enable row level security;

create policy "Users can view own check-ins"
  on public.check_ins for select
  using (auth.uid() = user_id);

create policy "Users can insert own check-ins"
  on public.check_ins for insert
  with check (auth.uid() = user_id);

create policy "Users can update own check-ins"
  on public.check_ins for update
  using (auth.uid() = user_id);

-- ── AUTO-UPDATE updated_at ────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger check_ins_updated_at
  before update on public.check_ins
  for each row execute procedure public.set_updated_at();

-- ── AUTO-CREATE PROFILE ON SIGNUP ─────────────────────────────
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', null)
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
