-- Real auth + Row Level Security.
-- Replaces the stub-auth model from 0001 (blanket anon grants, RLS off) with
-- Supabase Auth-backed identities and per-row access control. Coaches can only
-- touch their assigned athletes; only the owner manages users & assignments.

-- ---------------------------------------------------------------------------
-- Identity: public.users.id now references auth.users.id. Runs before seed, so
-- the table is empty here.
-- ---------------------------------------------------------------------------
alter table public.users
  add constraint users_id_fkey foreign key (id)
  references auth.users (id) on delete cascade;

-- Create the public.users profile row whenever an auth user is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.email),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'coach')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Access helpers. SECURITY DEFINER so they bypass RLS (prevents recursion when
-- a policy needs to read users/athletes).
-- ---------------------------------------------------------------------------
create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'owner'
  );
$$;

create or replace function public.can_access_athlete(aid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_owner() or exists (
    select 1 from public.athletes a
    where a.id = aid
      and (a.primary_coach_id = auth.uid() or a.secondary_coach_id = auth.uid())
  );
$$;

-- ---------------------------------------------------------------------------
-- Lock down grants: anon loses access; authenticated keeps table privileges
-- (RLS filters rows). The view follows its base table's RLS.
-- ---------------------------------------------------------------------------
revoke all on all tables in schema public from anon;
alter view public.athlete_current set (security_invoker = on);

-- ---------------------------------------------------------------------------
-- Enable RLS + policies
-- ---------------------------------------------------------------------------
alter table public.users enable row level security;
alter table public.athletes enable row level security;
alter table public.athlete_personality enable row level security;
alter table public.athlete_insights enable row level security;
alter table public.athlete_scores enable row level security;
alter table public.assessments enable row level security;
alter table public.movement_assessments enable row level security;
alter table public.body_measurements enable row level security;
alter table public.exercise_performance enable row level security;
alter table public.goals enable row level security;
alter table public.coach_notes enable row level security;

-- users: everyone authenticated can read (coach names appear throughout); only
-- the owner can manage user records.
create policy users_select on public.users
  for select to authenticated using (true);
create policy users_modify on public.users
  for all to authenticated using (public.is_owner()) with check (public.is_owner());

-- athletes: read if accessible; only the owner creates/updates/deletes (coach
-- reassignment is owner-only and nothing else writes this table).
create policy athletes_select on public.athletes
  for select to authenticated using (public.can_access_athlete(id));
create policy athletes_modify on public.athletes
  for all to authenticated using (public.is_owner()) with check (public.is_owner());

-- Child tables: full access scoped to the athlete the row belongs to.
do $$
declare t text;
begin
  foreach t in array array[
    'athlete_personality', 'athlete_insights', 'athlete_scores',
    'assessments', 'movement_assessments', 'body_measurements',
    'exercise_performance', 'goals', 'coach_notes'
  ]
  loop
    execute format(
      'create policy %1$s_access on public.%1$s for all to authenticated '
      || 'using (public.can_access_athlete(athlete_id)) '
      || 'with check (public.can_access_athlete(athlete_id));', t);
  end loop;
end;
$$;
