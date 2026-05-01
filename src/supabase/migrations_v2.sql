-- SkyFit v2 Migration — Auth Profiles, Workout Plans, Diet Plans, Attendance
-- Run AFTER migrations_v1.sql in your Supabase SQL Editor

-- ─── Profiles (one row per auth user) ────────────────────────────────────────
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  role text not null default 'client',   -- 'admin' | 'trainer' | 'client'
  name text,
  linked_id text,   -- clients.id for client role; employees.id for trainer role
  created_at timestamptz default now()
);

-- ─── Workout Plans ────────────────────────────────────────────────────────────
create table if not exists workout_plans (
  id uuid default gen_random_uuid() primary key,
  client_id text not null,    -- references clients.id
  trainer_id uuid,            -- references profiles.id
  trainer_name text,
  title text not null default 'Weekly Workout',
  days jsonb default '[]',    -- [{day, focus, exercises:[]}]
  week_label text default 'Week 1',
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ─── Diet Plans ───────────────────────────────────────────────────────────────
create table if not exists diet_plans (
  id uuid default gen_random_uuid() primary key,
  client_id text not null,
  trainer_id uuid,
  trainer_name text,
  title text not null default 'Diet Plan',
  content text default '',
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ─── Attendance ───────────────────────────────────────────────────────────────
create table if not exists attendance (
  id uuid default gen_random_uuid() primary key,
  client_id text not null,
  client_name text,
  check_in_date date default current_date,
  check_in_time text default '10:00 AM',
  created_at timestamptz default now()
);

-- ─── Disable RLS ──────────────────────────────────────────────────────────────
alter table profiles      disable row level security;
alter table workout_plans disable row level security;
alter table diet_plans    disable row level security;
alter table attendance    disable row level security;

-- ─── Trigger: auto-create profile on sign up ──────────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.email),
    coalesce(new.raw_user_meta_data->>'role', 'client')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── Seed: after signing up, set role manually ────────────────────────────────
-- To make a user admin:
--   update profiles set role = 'admin' where id = '<auth-user-id>';
-- To link a client to their clients row:
--   update profiles set linked_id = '<clients.id>' where id = '<auth-user-id>';
-- To link a trainer to their employees row:
--   update profiles set linked_id = '<employees.id>' where id = '<auth-user-id>';
