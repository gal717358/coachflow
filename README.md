# Coach CRM

A coach-facing athlete management system for boutique fitness studios. It is the
studio's **single source of truth about the athlete** — goals, personality,
fitness level, injuries, progress, coaching history, and next steps. It does not
replace Arbox (membership, payments, booking, attendance).

## Status — vertical slice

This is the first slice from the PRD: project scaffold + the full data model +
the **Athlete Snapshot** screen end-to-end on real Supabase.

Built:

- **Next.js 16** (App Router, TS) · **Tailwind v4** · **ShadCN UI** · **Supabase**
- Full Postgres schema + seed for all PRD modules (`supabase/`)
- **Real Supabase Auth (email + password)** + **Row Level Security**
  - Login at `/login` (middleware redirects unauthenticated users there); header
    shows the signed-in user with a Sign out button
  - **RLS enforces access in the database**, not just the UI: a coach can only
    read/write their assigned athletes; only the owner manages users &
    reassigns coaches (helpers `is_owner()`, `can_access_athlete()`)
  - Demo accounts (password `coachflow123`), one-click on the login page:
    `owner@studio.test` (owner), `john@studio.test`, `maya@studio.test` (coaches)
- **User management** (owner-only, `/users`): create coach/owner accounts, change
  roles, delete users. Create/delete use a **server-only service-role admin
  client** (`SUPABASE_SERVICE_ROLE_KEY`, never sent to the browser); role changes
  go through the RLS owner policy. Self-protected (can't delete/demote yourself).
- **Owner dashboard / roster** (`/`): studio-overview cards (Total, Active,
  Former, **Assessments Due**, **Goals Due**), a **Needs Attention** panel, and
  a filterable roster — search by name + filter by coach (owner), membership
  status, fitness level, and attention status (URL-driven, shareable)
- **Notifications** are derived (no cron): missing assessment, 90-day
  reassessment, and 30-day goal review — surfaced on the dashboard and as badges
  on athlete cards
- **Athlete Snapshot** (`/athletes/[id]`): summary card, coach rating, quick
  insights (strengths / improvement areas), personality ("how to coach them"),
  latest note, and recent performance — server-rendered with parallel queries
- **Tabbed athlete workspace** with **data-entry forms** (Server Actions +
  `useActionState`), all feeding the Snapshot:
  - **Notes** — add categorized notes; chronological timeline
  - **Goals** — create goals (target/current/horizon/due/status) + inline
    progress/status updates per goal
  - **Assessments** — fitness assessment (6 scores, experience level, injury
    history) with latest-score bars + history table; movement assessment
    (per-lift score, multi-select faults, notes) with a fault-tagged list
  - **Profile** — edit personality (motivation styles, communication, notes),
    quick insights (strengths/improvement areas), and coach rating (5 scores,
    auto-averaged overall) via upserts; everything the Snapshot shows is now
    editable in-app
  - **Measurements** — add body-composition entries; history table +
    **trend charts** (Recharts) for weight, body fat, muscle mass with
    direction-aware deltas
  - **Performance** — log lifts; auto-computed personal records, history, and an
    **estimated-1RM progression chart** (one line per lift)
- **Write permissions enforced server-side**: only the owner or an assigned
  coach can submit; everyone else sees a read-only view (forms hidden).
- **Transfer / handoff** (`/athletes/[id]/transfer`): an auto-generated
  coach-to-coach summary synthesized from assessments, ratings, personality,
  goals, and notes — professional summary (level, strengths, weaknesses,
  injuries) + personality summary (motivation triggers, communication,
  derived **retention risks**), with copy-to-clipboard. **Owner-only** coach
  reassignment (primary/secondary). Rule-based; AI-generated summaries are a
  documented V2 item.

Not yet built: editing of basic athlete demographics (name/phone/height/status).
The PRD's "filter by goal type" is intentionally omitted — goals are free-text
with no structured `type` field; add one to enable it.

### Known limitations

- Goal completion % assumes higher-is-better, so a *reduction* goal (e.g. "drop
  to 16% body fat" at 17.5%) can read 100% before it's met. Direction-aware
  goals are a follow-up.

## Run it

```bash
# 1. Start local Supabase (Docker required). Applies migrations + seed.
npx supabase start

# 2. Put the printed API URL + anon key into .env.local
cp .env.local.example .env.local
#   set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY

# 3. Run the app
pnpm dev   # http://localhost:3000 → redirects to /login
```

Sign in with a demo account (one-click on `/login`): `owner@studio.test`,
`john@studio.test`, or `maya@studio.test` — password `coachflow123`.

Reset the DB (re-apply schema + seed) anytime with `npx supabase db reset`.

> **Local apply note:** the malformed `.env` line `suprbase-pass=…` (hyphen in a
> var name) breaks the Supabase CLI, so `db reset`/`migration up` fail until it's
> fixed. The auth + RLS migration (`0002`) and seed in this repo were applied to
> the running local DB directly via `psql` instead; the files remain canonical
> for a clean `db reset` / cloud `db push`. `puppeteer-core` is a devDependency
> used only for the end-to-end login screenshot test.

## Deploying to Supabase Cloud

The migration in `supabase/migrations/` is cloud-ready (it applies cleanly to a
fresh database — verified locally). To push it to the cloud project
`zlahjbxcxrwhkrovgtom`:

> **First fix `.env`.** The Supabase CLI auto-loads `.env` and cannot parse the
> line `suprbase-pass=...` — variable names can't contain `-`. Rename it (e.g.
> `SUPABASE_DB_PASSWORD=...`) or remove it, otherwise every `supabase` command
> fails. Treat that value as a secret and rotate it; keep it out of git.

```bash
supabase login                              # personal access token
supabase link --project-ref zlahjbxcxrwhkrovgtom
supabase db push                            # applies migrations to cloud
# optional demo data:
psql "$CLOUD_DB_URL" -f supabase/seed.sql
```

Then point the app at the cloud project by setting `NEXT_PUBLIC_SUPABASE_URL`
and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`.

> Note: the app uses the **anon key** (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) for the
> client; RLS does the row filtering against the logged-in user's session. The
> cloud `.env` you added has a *publishable* key — both work with
> `@supabase/ssr`, but pick one naming and be consistent.

### Manual alternative (no CLI)

In the Supabase SQL editor, run `supabase/migrations/0001_initial_schema.sql`,
then `0002_auth_rls.sql`, then `supabase/seed.sql`, and set the URL + anon key in
`.env.local`.

## Data model notes

- `weight` / `body_fat` / `bmi` are **derived** from the latest
  `body_measurements` row (view `athlete_current`) — one source of truth for
  body composition. `bmi` and `age` are computed in the app.
- `estimated_1rm` (Epley) and athlete `overall` rating are generated columns.
- `athlete_insights` (strengths / improvement areas) was added beyond the PRD's
  table list to drive the Snapshot's Quick Insights with real data.
- **RLS** is enabled on every table (`0002_auth_rls.sql`). `public.users.id`
  references `auth.users.id`; a trigger creates the profile row on signup. Access
  is gated by `is_owner()` / `can_access_athlete()` SECURITY DEFINER helpers.
