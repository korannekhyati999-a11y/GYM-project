-- SkyFit Admin Panel — Supabase Migration
-- Run this ONCE in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/xjsjviilwemzkxwmnqvt/sql/new

create table if not exists enquiries (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  phone text,
  enquiry_date date default current_date,
  source text default 'Walk-in',
  status text default 'Warm',
  assigned_to text default 'Unassigned',
  follow_up_date date,
  comment text,
  created_at timestamptz default now()
);

create table if not exists follow_ups (
  id uuid default gen_random_uuid() primary key,
  type text default 'Call',
  name text not null,
  phone text,
  follow_up_date date default current_date,
  follow_up_time text default '10:00 AM',
  convertibility text default 'WARM',
  comment text,
  assigned_to text default 'Unassigned',
  completed boolean default false,
  created_at timestamptz default now()
);

create table if not exists membership_plans (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  price integer not null default 0,
  duration text default 'Monthly',
  features text[] default '{}',
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists memberships (
  id uuid default gen_random_uuid() primary key,
  member_name text not null,
  member_phone text,
  plan_name text,
  plan_price integer default 0,
  start_date date default current_date,
  end_date date,
  status text default 'Active',
  created_at timestamptz default now()
);

create table if not exists payments (
  id uuid default gen_random_uuid() primary key,
  member_name text not null,
  member_phone text,
  plan_name text,
  amount integer default 0,
  mode text default 'Cash',
  status text default 'Paid',
  payment_date date default current_date,
  created_at timestamptz default now()
);

create table if not exists schedule_classes (
  id uuid default gen_random_uuid() primary key,
  class_name text not null,
  class_type text default 'yoga',
  trainer_name text,
  day_of_week text default 'Mon',
  time_slot text default '6:00 AM',
  capacity integer default 20,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists employees (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  role text,
  phone text,
  email text,
  shift text default 'Morning',
  joined_date date default current_date,
  status text default 'Active',
  created_at timestamptz default now()
);

create table if not exists feedbacks (
  id uuid default gen_random_uuid() primary key,
  member_name text not null,
  member_phone text,
  rating integer default 5,
  category text default 'General',
  comment text,
  feedback_date date default current_date,
  created_at timestamptz default now()
);

-- ─── Allow anon key full access (admin panel only) ───────────────────────────
-- Run this block AFTER the tables are created.
-- This disables RLS so the anon key can read/write all rows.

alter table clients         disable row level security;
alter table enquiries       disable row level security;
alter table follow_ups      disable row level security;
alter table membership_plans disable row level security;
alter table memberships     disable row level security;
alter table payments        disable row level security;
alter table schedule_classes disable row level security;
alter table employees       disable row level security;
alter table feedbacks       disable row level security;
