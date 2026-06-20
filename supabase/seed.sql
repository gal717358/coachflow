-- Coach CRM — demo seed data
-- Fixed UUIDs so relationships are easy to follow and re-runs are deterministic.

-- Users -----------------------------------------------------------------------
-- Seed real Supabase Auth accounts; the on_auth_user_created trigger creates the
-- matching public.users rows from the name/role metadata. Dev password for all
-- three accounts: coachflow123
-- Token columns are set to '' (not null): GoTrue scans them into non-nullable
-- Go strings and a NULL there breaks login ("Database error querying schema").
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change, email_change_token_new,
  email_change_token_current, phone_change, phone_change_token, reauthentication_token
) values
  ('00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   'authenticated', 'authenticated', 'owner@studio.test',
   crypt('coachflow123', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}',
   '{"name":"Dana Klein","role":"owner"}', now(), now(),
   '', '', '', '', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222',
   'authenticated', 'authenticated', 'john@studio.test',
   crypt('coachflow123', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}',
   '{"name":"John Park","role":"coach"}', now(), now(),
   '', '', '', '', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333',
   'authenticated', 'authenticated', 'maya@studio.test',
   crypt('coachflow123', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}',
   '{"name":"Maya Stern","role":"coach"}', now(), now(),
   '', '', '', '', '', '', '', '')
on conflict (id) do nothing;

insert into auth.identities (
  id, user_id, provider_id, identity_data, provider, created_at, updated_at
) values
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
   '11111111-1111-1111-1111-111111111111',
   '{"sub":"11111111-1111-1111-1111-111111111111","email":"owner@studio.test"}',
   'email', now(), now()),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222',
   '22222222-2222-2222-2222-222222222222',
   '{"sub":"22222222-2222-2222-2222-222222222222","email":"john@studio.test"}',
   'email', now(), now()),
  (gen_random_uuid(), '33333333-3333-3333-3333-333333333333',
   '33333333-3333-3333-3333-333333333333',
   '{"sub":"33333333-3333-3333-3333-333333333333","email":"maya@studio.test"}',
   'email', now(), now())
on conflict do nothing;

-- Athletes --------------------------------------------------------------------
insert into public.athletes
  (id, first_name, last_name, phone, email, gender, birth_date, height_cm, start_date, status, primary_coach_id, secondary_coach_id) values
  ('a0000001-0000-0000-0000-000000000001', 'Alex',  'Rivera',  '+972-50-1112233', 'alex@example.com',  'male',   '1992-04-15', 178.0, '2025-09-01', 'active', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333'),
  ('a0000002-0000-0000-0000-000000000002', 'Noa',   'Levi',    '+972-52-2223344', 'noa@example.com',   'female', '1996-11-02', 165.0, '2025-10-15', 'active', '33333333-3333-3333-3333-333333333333', null),
  ('a0000003-0000-0000-0000-000000000003', 'Tom',   'Becker',  '+972-54-3334455', 'tom@example.com',   'male',   '1988-01-20', 183.0, '2024-06-10', 'frozen', '22222222-2222-2222-2222-222222222222', null),
  ('a0000004-0000-0000-0000-000000000004', 'Shir',  'Cohen',   '+972-58-4445566', 'shir@example.com',  'female', '2000-07-30', 170.0, '2026-01-05', 'active', '33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222')
on conflict (id) do nothing;

-- Personality -----------------------------------------------------------------
insert into public.athlete_personality (athlete_id, motivation_styles, communication_style, notes) values
  ('a0000001-0000-0000-0000-000000000001', '{competitive,data-driven,achievement-focused}', 'technical',  'Loves tracking numbers. Responds best to positive reinforcement and measurable goals.'),
  ('a0000002-0000-0000-0000-000000000002', '{needs-encouragement,social}', 'supportive', 'Gets discouraged easily. Performs better with clear structure and frequent check-ins.'),
  ('a0000003-0000-0000-0000-000000000003', '{independent,achievement-focused}', 'direct', 'Self-motivated, prefers minimal hand-holding. Travels often for work.'),
  ('a0000004-0000-0000-0000-000000000004', '{social,needs-encouragement,competitive}', 'high-energy', 'New athlete, very enthusiastic. Thrives in group settings.')
on conflict (athlete_id) do nothing;

-- Insights --------------------------------------------------------------------
insert into public.athlete_insights (athlete_id, strengths, improvements) values
  ('a0000001-0000-0000-0000-000000000001', '{"Strong lower body","Excellent attendance","High motivation"}', '{"Shoulder mobility","Conditioning","Nutrition consistency"}'),
  ('a0000002-0000-0000-0000-000000000002', '{"Great coordination","Consistent effort","Coachable"}', '{"Upper-body strength","Confidence under load","Bracing"}'),
  ('a0000003-0000-0000-0000-000000000003', '{"Advanced technique","Strong pull","Independent"}', '{"Attendance consistency","Mobility","Recovery habits"}'),
  ('a0000004-0000-0000-0000-000000000004', '{"High energy","Fast learner","Positive attitude"}', '{"Baseline strength","Movement literacy","Pacing"}')
on conflict (athlete_id) do nothing;

-- Body measurements (multiple dates → trend charts) ---------------------------
insert into public.body_measurements (athlete_id, date, weight, body_fat, muscle_mass, waist, hips, arm) values
  ('a0000001-0000-0000-0000-000000000001', '2025-09-01', 84.0, 22.0, 36.0, 92.0, 100.0, 35.0),
  ('a0000001-0000-0000-0000-000000000001', '2025-12-01', 82.5, 20.5, 37.0, 90.0, 99.0, 35.5),
  ('a0000001-0000-0000-0000-000000000001', '2026-03-01', 81.0, 18.8, 38.0, 88.0, 98.0, 36.0),
  ('a0000001-0000-0000-0000-000000000001', '2026-06-01', 80.0, 17.5, 38.5, 86.5, 97.5, 36.5),
  ('a0000002-0000-0000-0000-000000000002', '2025-10-15', 62.0, 28.0, 24.0, 74.0, 96.0, 27.0),
  ('a0000002-0000-0000-0000-000000000002', '2026-01-15', 61.0, 26.5, 24.5, 73.0, 95.0, 27.5),
  ('a0000002-0000-0000-0000-000000000002', '2026-05-15', 60.0, 25.0, 25.0, 71.5, 94.0, 28.0),
  ('a0000003-0000-0000-0000-000000000003', '2024-06-10', 88.0, 19.0, 40.0, 90.0, 101.0, 38.0),
  ('a0000003-0000-0000-0000-000000000003', '2025-06-10', 86.0, 17.0, 41.0, 88.0, 100.0, 38.5),
  ('a0000004-0000-0000-0000-000000000004', '2026-01-05', 68.0, 30.0, 25.0, 78.0, 100.0, 28.0),
  ('a0000004-0000-0000-0000-000000000004', '2026-04-05', 67.0, 29.0, 25.5, 77.0, 99.0, 28.5)
on conflict do nothing;

-- Exercise performance (history → PRs + Recent Performance) -------------------
insert into public.exercise_performance (athlete_id, date, exercise, weight, reps) values
  ('a0000001-0000-0000-0000-000000000001', '2025-09-10', 'squat',       100.0, 5),
  ('a0000001-0000-0000-0000-000000000001', '2026-01-10', 'squat',       120.0, 5),
  ('a0000001-0000-0000-0000-000000000001', '2026-06-05', 'squat',       140.0, 3),
  ('a0000001-0000-0000-0000-000000000001', '2026-06-05', 'deadlift',    170.0, 3),
  ('a0000001-0000-0000-0000-000000000001', '2026-06-05', 'bench_press', 90.0,  5),
  ('a0000001-0000-0000-0000-000000000001', '2026-06-05', 'pull_up',     15.0,  8),
  ('a0000002-0000-0000-0000-000000000002', '2026-05-20', 'squat',       60.0,  5),
  ('a0000002-0000-0000-0000-000000000002', '2026-05-20', 'deadlift',    80.0,  5),
  ('a0000002-0000-0000-0000-000000000002', '2026-05-20', 'bench_press', 35.0,  6),
  ('a0000002-0000-0000-0000-000000000002', '2026-05-20', 'pull_up',     0.0,   3),
  ('a0000003-0000-0000-0000-000000000003', '2025-05-01', 'squat',       150.0, 3),
  ('a0000003-0000-0000-0000-000000000003', '2025-05-01', 'deadlift',    200.0, 2),
  ('a0000003-0000-0000-0000-000000000003', '2025-05-01', 'bench_press', 110.0, 3),
  ('a0000004-0000-0000-0000-000000000004', '2026-04-10', 'squat',       40.0,  8),
  ('a0000004-0000-0000-0000-000000000004', '2026-04-10', 'deadlift',    50.0,  8)
on conflict do nothing;

-- Fitness assessments ---------------------------------------------------------
insert into public.assessments
  (athlete_id, date, strength_score, endurance_score, mobility_score, stability_score, coordination_score, awareness_score, experience_level, injury_notes) values
  ('a0000001-0000-0000-0000-000000000001', '2026-03-01', 8, 6, 5, 7, 7, 7, 'intermediate', 'Lower back sensitivity under heavy load. No active injuries.'),
  ('a0000002-0000-0000-0000-000000000002', '2026-05-15', 4, 6, 7, 6, 8, 6, 'beginner',     'No injury history.'),
  ('a0000003-0000-0000-0000-000000000003', '2025-06-10', 9, 7, 6, 8, 8, 9, 'advanced',     'Previous ACL reconstruction (right knee, 2019).'),
  ('a0000004-0000-0000-0000-000000000004', '2026-01-20', 3, 5, 6, 5, 6, 5, 'beginner',     'No injury history.')
on conflict do nothing;

-- Movement assessments --------------------------------------------------------
insert into public.movement_assessments (athlete_id, date, movement, score, notes, issues) values
  ('a0000001-0000-0000-0000-000000000001', '2026-03-01', 'squat',        7, 'Good depth, slight knee valgus at bottom.', '{knee_valgus}'),
  ('a0000001-0000-0000-0000-000000000001', '2026-03-01', 'overhead_press', 5, 'Limited overhead range.', '{shoulder_restriction}'),
  ('a0000002-0000-0000-0000-000000000002', '2026-05-15', 'deadlift',     5, 'Needs work on bracing and hip hinge.', '{poor_bracing}'),
  ('a0000003-0000-0000-0000-000000000003', '2025-06-10', 'deadlift',     9, 'Excellent technique.', '{}')
on conflict do nothing;

-- Goals -----------------------------------------------------------------------
insert into public.goals (athlete_id, title, description, target_value, current_value, due_date, horizon_days, status) values
  ('a0000001-0000-0000-0000-000000000001', 'Squat 150kg', 'Hit a 150kg back squat for a single.', 150, 140, '2026-09-01', 90, 'in_progress'),
  ('a0000001-0000-0000-0000-000000000001', 'Drop to 16% body fat', 'Lean down while maintaining strength.', 16, 17.5, '2026-12-01', 180, 'in_progress'),
  ('a0000002-0000-0000-0000-000000000002', 'First strict pull-up', 'Achieve one unassisted pull-up.', 1, 0, '2026-07-15', 30, 'in_progress'),
  ('a0000003-0000-0000-0000-000000000003', 'Return to consistent training', 'Re-establish 3x/week attendance.', 3, 1, '2026-08-01', 90, 'not_started'),
  ('a0000004-0000-0000-0000-000000000004', 'Learn the 4 main lifts', 'Confident technique on squat/DL/bench/pull.', 4, 2, '2026-04-05', 90, 'completed')
on conflict do nothing;

-- Coach notes -----------------------------------------------------------------
insert into public.coach_notes (athlete_id, coach_id, category, note, created_at) values
  ('a0000001-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'training',   'Significant improvement in squat depth. Ready to push intensity next block.', '2026-06-05 09:00+00'),
  ('a0000001-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'nutrition',  'Discussed protein intake; aiming for 160g/day.', '2026-05-20 09:00+00'),
  ('a0000002-0000-0000-0000-000000000002', '33333333-3333-3333-3333-333333333333', 'motivation', 'Was discouraged after a hard session — reframed progress around pull-up negatives. Left motivated.', '2026-05-22 17:00+00'),
  ('a0000003-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', 'general',    'Membership frozen due to travel. Plans to return in August.', '2026-04-02 12:00+00'),
  ('a0000004-0000-0000-0000-000000000004', '33333333-3333-3333-3333-333333333333', 'training',   'Completed onboarding. Solid grasp of squat and deadlift basics.', '2026-04-10 10:00+00')
on conflict do nothing;

-- Athlete scores --------------------------------------------------------------
insert into public.athlete_scores (athlete_id, consistency, discipline, technique, progress, engagement) values
  ('a0000001-0000-0000-0000-000000000001', 9, 8, 7, 8, 9),
  ('a0000002-0000-0000-0000-000000000002', 7, 7, 5, 6, 8),
  ('a0000003-0000-0000-0000-000000000003', 4, 8, 9, 5, 6),
  ('a0000004-0000-0000-0000-000000000004', 8, 6, 4, 7, 9)
on conflict (athlete_id) do nothing;
