-- Coach CRM — initial schema
-- Single source of truth about the athlete. Arbox handles membership/payments/booking;
-- this DB holds coaching knowledge: goals, personality, assessments, progress, notes.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Users (coaches & owners). Stub-auth for the MVP: this is the app's own user
-- table, not yet tied to Supabase auth.users. Real auth + RLS come later.
-- ---------------------------------------------------------------------------
create table public.users (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null unique,
  role       text not null default 'coach' check (role in ('owner', 'coach')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Athletes
-- weight / body_fat / bmi are intentionally NOT stored here — they are derived
-- from the latest body_measurements row (see view athlete_current) so there is
-- one source of truth for body composition. height is fixed per athlete so it
-- lives here.
-- ---------------------------------------------------------------------------
create table public.athletes (
  id                uuid primary key default gen_random_uuid(),
  first_name        text not null,
  last_name         text not null,
  phone             text,
  email             text,
  gender            text check (gender in ('male', 'female', 'other')),
  birth_date        date,
  height_cm         numeric(5,1),
  start_date        date,
  status            text not null default 'active' check (status in ('active', 'frozen', 'former')),
  primary_coach_id  uuid references public.users(id) on delete set null,
  secondary_coach_id uuid references public.users(id) on delete set null,
  created_at        timestamptz not null default now()
);
create index on public.athletes (primary_coach_id);
create index on public.athletes (status);

-- ---------------------------------------------------------------------------
-- Personality profile (one row per athlete)
-- ---------------------------------------------------------------------------
create table public.athlete_personality (
  athlete_id          uuid primary key references public.athletes(id) on delete cascade,
  motivation_styles   text[] not null default '{}',
  communication_style text check (communication_style in ('direct', 'supportive', 'technical', 'high-energy')),
  notes               text,
  updated_at          timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Coach-authored quick insights surfaced on the Snapshot (top strengths /
-- improvement areas). Not in the original PRD table list but needed to drive
-- the Snapshot's "Quick Insights" with real data.
-- ---------------------------------------------------------------------------
create table public.athlete_insights (
  athlete_id   uuid primary key references public.athletes(id) on delete cascade,
  strengths    text[] not null default '{}',
  improvements text[] not null default '{}',
  updated_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Fitness assessments (periodic)
-- ---------------------------------------------------------------------------
create table public.assessments (
  id                uuid primary key default gen_random_uuid(),
  athlete_id        uuid not null references public.athletes(id) on delete cascade,
  date              date not null default current_date,
  strength_score    smallint check (strength_score between 1 and 10),
  endurance_score   smallint check (endurance_score between 1 and 10),
  mobility_score    smallint check (mobility_score between 1 and 10),
  stability_score   smallint check (stability_score between 1 and 10),
  coordination_score smallint check (coordination_score between 1 and 10),
  awareness_score   smallint check (awareness_score between 1 and 10),
  experience_level  text check (experience_level in ('beginner', 'intermediate', 'advanced')),
  injury_notes      text,
  created_at        timestamptz not null default now()
);
create index on public.assessments (athlete_id, date desc);

-- ---------------------------------------------------------------------------
-- Movement (technique) assessments — one row per movement per session
-- ---------------------------------------------------------------------------
create table public.movement_assessments (
  id          uuid primary key default gen_random_uuid(),
  athlete_id  uuid not null references public.athletes(id) on delete cascade,
  date        date not null default current_date,
  movement    text not null check (movement in ('squat', 'deadlift', 'bench_press', 'pull_up', 'overhead_press')),
  score       smallint check (score between 1 and 10),
  notes       text,
  issues      text[] not null default '{}',
  created_at  timestamptz not null default now()
);
create index on public.movement_assessments (athlete_id, date desc);

-- ---------------------------------------------------------------------------
-- Body measurements (history). Source of truth for body composition.
-- ---------------------------------------------------------------------------
create table public.body_measurements (
  id          uuid primary key default gen_random_uuid(),
  athlete_id  uuid not null references public.athletes(id) on delete cascade,
  date        date not null default current_date,
  weight      numeric(5,1),
  body_fat    numeric(4,1),
  muscle_mass numeric(5,1),
  waist       numeric(5,1),
  hips        numeric(5,1),
  arm         numeric(5,1),
  created_at  timestamptz not null default now()
);
create index on public.body_measurements (athlete_id, date desc);

-- ---------------------------------------------------------------------------
-- Exercise performance (history). estimated_1rm is computed (Epley) unless
-- explicitly provided.
-- ---------------------------------------------------------------------------
create table public.exercise_performance (
  id            uuid primary key default gen_random_uuid(),
  athlete_id    uuid not null references public.athletes(id) on delete cascade,
  date          date not null default current_date,
  exercise      text not null check (exercise in ('squat', 'deadlift', 'bench_press', 'pull_up')),
  weight        numeric(6,1) not null,
  reps          smallint not null check (reps > 0),
  estimated_1rm numeric(6,1) generated always as (round(weight * (1 + reps::numeric / 30), 1)) stored,
  created_at    timestamptz not null default now()
);
create index on public.exercise_performance (athlete_id, exercise, date desc);

-- ---------------------------------------------------------------------------
-- Goals
-- ---------------------------------------------------------------------------
create table public.goals (
  id            uuid primary key default gen_random_uuid(),
  athlete_id    uuid not null references public.athletes(id) on delete cascade,
  title         text not null,
  description   text,
  target_value  numeric,
  current_value numeric,
  due_date      date,
  horizon_days  smallint check (horizon_days in (30, 90, 180)),
  status        text not null default 'not_started'
                check (status in ('not_started', 'in_progress', 'completed', 'cancelled')),
  created_at    timestamptz not null default now()
);
create index on public.goals (athlete_id, status);

-- ---------------------------------------------------------------------------
-- Coach notes timeline
-- ---------------------------------------------------------------------------
create table public.coach_notes (
  id          uuid primary key default gen_random_uuid(),
  athlete_id  uuid not null references public.athletes(id) on delete cascade,
  coach_id    uuid references public.users(id) on delete set null,
  category    text not null default 'general'
              check (category in ('training', 'nutrition', 'injury', 'motivation', 'general')),
  note        text not null,
  created_at  timestamptz not null default now()
);
create index on public.coach_notes (athlete_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Athlete ratings (one row per athlete). overall is the average.
-- ---------------------------------------------------------------------------
create table public.athlete_scores (
  athlete_id  uuid primary key references public.athletes(id) on delete cascade,
  consistency smallint check (consistency between 1 and 10),
  discipline  smallint check (discipline between 1 and 10),
  technique   smallint check (technique between 1 and 10),
  progress    smallint check (progress between 1 and 10),
  engagement  smallint check (engagement between 1 and 10),
  overall     numeric(3,1) generated always as (
    round((coalesce(consistency,0) + coalesce(discipline,0) + coalesce(technique,0)
         + coalesce(progress,0) + coalesce(engagement,0))::numeric / 5, 1)
  ) stored,
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- View: latest body composition per athlete (drives Snapshot summary card)
-- ---------------------------------------------------------------------------
create view public.athlete_current as
select distinct on (bm.athlete_id)
  bm.athlete_id,
  bm.date as measured_on,
  bm.weight,
  bm.body_fat,
  bm.muscle_mass
from public.body_measurements bm
order by bm.athlete_id, bm.date desc;

-- ---------------------------------------------------------------------------
-- Grants. RLS stays disabled for the stub-auth MVP; real RLS arrives with
-- Supabase Auth. Supabase default privileges already cover anon/authenticated,
-- but we grant explicitly to be safe for local + cloud.
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to anon, authenticated;
grant select on public.athlete_current to anon, authenticated;
