-- service_role table grants.
--
-- 0001 granted table privileges to anon + authenticated only; 0002 revoked
-- anon. service_role was never granted, so privileged server actions that use
-- the service-role client to bypass RLS (e.g. createAthlete) hit
-- "permission denied for table athletes" on direct public-table writes.
-- (The earlier createUser/deleteUser actions only touched the auth schema via
-- the GoTrue admin API, so they never exercised this path.)
--
-- Restore the standard Supabase posture: service_role has full access to the
-- public schema. RLS does not apply to service_role, so this is purely the
-- missing GRANT layer.

grant usage on schema public to service_role;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant all on all functions in schema public to service_role;

-- Future objects created in public inherit the same grant.
alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant all on sequences to service_role;
alter default privileges in schema public grant all on functions to service_role;
