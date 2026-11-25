-- =====================================================================
-- 0016: Custom roles with permissions.
-- The Founder (and anyone given "manage_roles") can create roles, tick what
-- each role may do, and give roles to people. Permissions:
--   ban_users        ban / unban users
--   view_logs        see the bans list and the moderation log
--   view_code        read everyone's code, even during a running contest
--   host_contests    schedule and delete contests (sees hidden contest problems)
--   create_problems  write new problems (sees hidden problems)
--   review_cheating  use the cheat detector (banning from it also needs ban_users)
--   manage_roles     create/edit roles and give/remove roles below their own rank
-- Rank decides who outranks whom: you can only ban, give or edit roles BELOW your rank.
-- The Founder role has every permission and can't be edited, deleted or banned.
-- =====================================================================

create table if not exists public.roles (
  id text primary key check (id ~ '^[a-z0-9_]{2,24}$'),
  name text not null unique check (char_length(name) between 2 and 24),
  color text not null default 'blue' check (color in ('gray','red','orange','amber','green','teal','blue','violet','pink')),
  rank integer not null check (rank between 0 and 100),
  permissions text[] not null default '{}',
  show_title boolean not null default true,      -- show the role name as a title on profile / leaderboard
  is_system boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.roles enable row level security;
revoke all on public.roles from anon, authenticated;
grant select on public.roles to anon, authenticated;
drop policy if exists roles_read on public.roles;
create policy roles_read on public.roles for select to anon, authenticated using (true);

create or replace function public.all_permissions() returns text[] language sql immutable as $$
  select array['ban_users','view_logs','view_code','host_contests','create_problems','review_cheating','manage_roles'];
$$;

insert into public.roles (id, name, color, rank, permissions, show_title, is_system) values
  ('founder',    'Founder',    'amber',  100, public.all_permissions(), true, true),
  ('co_founder', 'Co-Founder', 'violet',  80, array['ban_users','view_logs','view_code','host_contests','create_problems','review_cheating'], true, false),
  ('admin',      'Admin',      'blue',    60, array['ban_users','view_logs','view_code','host_contests','create_problems','review_cheating'], true, false),
  ('user',       'User',       'gray',     0, '{}', false, true)
on conflict (id) do nothing;

-- profiles.role: any role from the table (replaces the old fixed list)
do $$
declare c text;
begin
  for c in select conname from pg_constraint where conrelid = 'public.profiles'::regclass and contype = 'c'
           and pg_get_constraintdef(oid) ilike '%co_founder%' loop
    execute format('alter table public.profiles drop constraint %I', c);
  end loop;
end $$;
alter table public.profiles drop constraint if exists profiles_role_fkey;
alter table public.profiles add constraint profiles_role_fkey foreign key (role) references public.roles(id) on update cascade;

-- ---------------------------------------------------------------- checks
create or replace function public.role_rank(p_role text) returns int
language sql stable security definer set search_path = public as $$
  select coalesce((select rank from public.roles where id = p_role), 0);
$$;

create or replace function public.has_perm(p_user uuid, p_perm text) returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select r.id = 'founder' or p_perm = any(r.permissions)
                   from public.profiles p join public.roles r on r.id = p.role where p.id = p_user), false)
     and not public.is_banned(p_user);
$$;
grant execute on function public.has_perm(uuid, text) to anon, authenticated;

-- "staff" = has at least one permission (opens the Admin panel)
create or replace function public.is_staff(p_user uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select r.id = 'founder' or cardinality(r.permissions) > 0
                   from public.profiles p join public.roles r on r.id = p.role where p.id = p_user), false);
$$;

drop function if exists public.my_moderation();
create or replace function public.my_moderation()
returns table (role text, banned boolean, reason text, expires_at timestamptz, role_name text, permissions text[])
language sql stable security definer set search_path = public as $$
  select p.role, b.id is not null, b.reason, b.expires_at, r.name,
         case when r.id = 'founder' then public.all_permissions() else r.permissions end
  from public.profiles p
  join public.roles r on r.id = p.role
  left join lateral (select * from public.bans x where x.user_id = p.id and x.lifted_at is null
                     and (x.expires_at is null or x.expires_at > now()) order by x.created_at desc limit 1) b on true
  where p.id = auth.uid();
$$;
grant execute on function public.my_moderation() to authenticated;

-- ---------------------------------------------------------------- bans now need ban_users
create or replace function public.mod_ban(p_actor uuid, p_username text, p_reason text, p_until timestamptz)
returns text language plpgsql security definer set search_path = public as $$
declare v_actor text; v_target uuid; v_target_role text;
begin
  select role into v_actor from public.profiles where id = p_actor;
  if not public.has_perm(p_actor, 'ban_users') then raise exception 'You are not allowed to ban users.'; end if;
  if public.is_banned(p_actor) then raise exception 'Your account is banned.'; end if;
  select id, role into v_target, v_target_role from public.profiles where username = p_username::citext;
  if v_target is null then raise exception 'No user called @%.', p_username; end if;
  if v_target = p_actor then raise exception 'You can''t ban yourself.'; end if;
  if v_target_role = 'founder' then raise exception 'The founder can''t be banned.'; end if;
  if public.role_rank(v_target_role) >= public.role_rank(v_actor) then
    raise exception 'You can only ban users with a lower rank than yours.';
  end if;
  if p_until is not null and p_until <= now() then raise exception 'The ban end time must be in the future.'; end if;
  -- replace any active ban
  update public.bans set lifted_at = now(), lifted_by = p_actor
    where user_id = v_target and lifted_at is null and (expires_at is null or expires_at > now());
  insert into public.bans (user_id, banned_by, reason, expires_at) values (v_target, p_actor, coalesce(p_reason, ''), p_until);
  insert into public.moderation_log (actor_id, action, target_id, details)
    values (p_actor, 'ban', v_target, coalesce(p_reason, '') || case when p_until is null then ' (permanent)' else ' (until ' || to_char(p_until at time zone 'utc', 'YYYY-MM-DD HH24:MI') || ' UTC)' end);
  return 'ok';
end $$;

create or replace function public.mod_unban(p_actor uuid, p_username text)
returns text language plpgsql security definer set search_path = public as $$
declare v_actor text; v_target uuid; v_n int;
begin
  select role into v_actor from public.profiles where id = p_actor;
  if not public.has_perm(p_actor, 'ban_users') then raise exception 'You are not allowed to unban users.'; end if;
  select id into v_target from public.profiles where username = p_username::citext;
  if v_target is null then raise exception 'No user called @%.', p_username; end if;
  update public.bans set lifted_at = now(), lifted_by = p_actor
    where user_id = v_target and lifted_at is null and (expires_at is null or expires_at > now());
  get diagnostics v_n = row_count;
  if v_n = 0 then raise exception '@% is not banned.', p_username; end if;
  insert into public.moderation_log (actor_id, action, target_id, details) values (p_actor, 'unban', v_target, '');
  return 'ok';
end $$;

-- ---------------------------------------------------------------- give / remove roles
create or replace function public.mod_set_role(p_actor uuid, p_username text, p_role text)
returns text language plpgsql security definer set search_path = public as $$
declare v_actor_role text; v_actor_rank int; v_target uuid; v_old text; v_new public.roles;
begin
  if not public.has_perm(p_actor, 'manage_roles') then raise exception 'You are not allowed to change roles.'; end if;
  select role into v_actor_role from public.profiles where id = p_actor;
  v_actor_rank := public.role_rank(v_actor_role);
  select * into v_new from public.roles where id = p_role;
  if v_new.id is null then raise exception 'There is no role called "%".', p_role; end if;
  if v_new.id = 'founder' then raise exception 'There can only be one Founder.'; end if;
  select id, role into v_target, v_old from public.profiles where username = p_username::citext;
  if v_target is null then raise exception 'No user called @%.', p_username; end if;
  if v_target = p_actor then raise exception 'You can''t change your own role.'; end if;
  if v_old = 'founder' then raise exception 'The Founder''s role can''t be changed.'; end if;
  if v_actor_role <> 'founder' then
    if v_new.rank >= v_actor_rank then raise exception 'You can only give roles ranked below your own.'; end if;
    if public.role_rank(v_old) >= v_actor_rank then raise exception 'You can''t change the role of someone at your level or above.'; end if;
  end if;
  update public.profiles set role = v_new.id,
    special_title = case
      when v_new.show_title then v_new.name
      when special_title in (select name from public.roles) then null
      else special_title end
  where id = v_target;
  insert into public.moderation_log (actor_id, action, target_id, details)
    values (p_actor, 'role', v_target, coalesce(v_old, 'user') || ' -> ' || v_new.id);
  return 'ok';
end $$;

-- ---------------------------------------------------------------- create / edit / delete roles
create or replace function public.mod_save_role(p_actor uuid, p_id text, p_name text, p_color text, p_rank int,
                                                p_permissions text[], p_show_title boolean)
returns text language plpgsql security definer set search_path = public as $$
declare v_actor_role text; v_actor_rank int; v_actor_perms text[]; v_old public.roles; v_id text; v_n int := 1;
begin
  if not public.has_perm(p_actor, 'manage_roles') then raise exception 'You are not allowed to manage roles.'; end if;
  select p.role, r.rank, case when r.id = 'founder' then public.all_permissions() else r.permissions end
    into v_actor_role, v_actor_rank, v_actor_perms
    from public.profiles p join public.roles r on r.id = p.role where p.id = p_actor;
  p_name := btrim(coalesce(p_name, ''));
  if char_length(p_name) < 2 or char_length(p_name) > 24 then raise exception 'The role name must be 2–24 characters.'; end if;
  if p_rank is null or p_rank < 1 or p_rank > 99 then raise exception 'Rank must be between 1 and 99.'; end if;
  p_permissions := coalesce(p_permissions, '{}');
  if not (p_permissions <@ public.all_permissions()) then raise exception 'Unknown permission.'; end if;
  if v_actor_role <> 'founder' then
    if p_rank >= v_actor_rank then raise exception 'Your roles must be ranked below your own (%).', v_actor_rank; end if;
    if not (p_permissions <@ v_actor_perms) then raise exception 'You can''t give a permission you don''t have.'; end if;
  end if;
  if p_id is not null and p_id <> '' then
    select * into v_old from public.roles where id = p_id;
    if v_old.id is null then raise exception 'Role not found.'; end if;
    if v_old.id in ('founder', 'user') then raise exception 'This role can''t be edited.'; end if;
    if v_actor_role <> 'founder' and v_old.rank >= v_actor_rank then raise exception 'You can''t edit a role at your level or above.'; end if;
    if exists (select 1 from public.roles where name ilike p_name and id <> v_old.id) then raise exception 'A role called "%" already exists.', p_name; end if;
    update public.roles set name = p_name, color = p_color, rank = p_rank, permissions = p_permissions, show_title = coalesce(p_show_title, true)
     where id = v_old.id;
    -- keep members' titles in step with the role
    update public.profiles set special_title = case when coalesce(p_show_title, true) then p_name else null end
     where role = v_old.id and (special_title is null or special_title = v_old.name);
    insert into public.moderation_log (actor_id, action, details) values (p_actor, 'role_edit', v_old.id || ': ' || p_name || ' [' || array_to_string(p_permissions, ', ') || ']');
    return v_old.id;
  end if;
  if exists (select 1 from public.roles where name ilike p_name) then raise exception 'A role called "%" already exists.', p_name; end if;
  v_id := left(trim(both '_' from regexp_replace(lower(p_name), '[^a-z0-9]+', '_', 'g')), 20);
  if char_length(v_id) < 2 then v_id := 'role'; end if;
  while exists (select 1 from public.roles where id = v_id || case when v_n = 1 then '' else '_' || v_n end) loop v_n := v_n + 1; end loop;
  v_id := v_id || case when v_n = 1 then '' else '_' || v_n end;
  insert into public.roles (id, name, color, rank, permissions, show_title) values (v_id, p_name, p_color, p_rank, p_permissions, coalesce(p_show_title, true));
  insert into public.moderation_log (actor_id, action, details) values (p_actor, 'role_create', v_id || ': ' || p_name || ' [' || array_to_string(p_permissions, ', ') || ']');
  return v_id;
end $$;

create or replace function public.mod_delete_role(p_actor uuid, p_id text)
returns text language plpgsql security definer set search_path = public as $$
declare v_actor_role text; v_old public.roles; v_n int;
begin
  if not public.has_perm(p_actor, 'manage_roles') then raise exception 'You are not allowed to manage roles.'; end if;
  select role into v_actor_role from public.profiles where id = p_actor;
  select * into v_old from public.roles where id = p_id;
  if v_old.id is null then raise exception 'Role not found.'; end if;
  if v_old.is_system then raise exception 'This role can''t be deleted.'; end if;
  if v_actor_role <> 'founder' and v_old.rank >= public.role_rank(v_actor_role) then raise exception 'You can''t delete a role at your level or above.'; end if;
  update public.profiles set role = 'user', special_title = case when special_title = v_old.name then null else special_title end
   where role = v_old.id;
  get diagnostics v_n = row_count;
  delete from public.roles where id = v_old.id;
  insert into public.moderation_log (actor_id, action, details) values (p_actor, 'role_delete', v_old.name || ' (' || v_n || ' members became users)');
  return 'ok';
end $$;

drop function if exists public.mod_staff();
create or replace function public.mod_staff()
returns table (username text, role text, role_name text, color text, rank integer)
language sql stable security definer set search_path = public as $$
  select p.username::text, p.role, r.name, r.color, r.rank
  from public.profiles p join public.roles r on r.id = p.role
  where p.role <> 'user' order by r.rank desc, p.username;
$$;

revoke all on function public.mod_set_role(uuid, text, text) from public, anon, authenticated;
revoke all on function public.mod_save_role(uuid, text, text, text, int, text[], boolean) from public, anon, authenticated;
revoke all on function public.mod_delete_role(uuid, text) from public, anon, authenticated;
revoke all on function public.mod_staff() from public, anon, authenticated;
revoke all on function public.mod_ban(uuid, text, text, timestamptz) from public, anon, authenticated;
revoke all on function public.mod_unban(uuid, text) from public, anon, authenticated;
grant execute on function public.mod_set_role(uuid, text, text) to service_role;
grant execute on function public.mod_save_role(uuid, text, text, text, int, text[], boolean) to service_role;
grant execute on function public.mod_delete_role(uuid, text) to service_role;
grant execute on function public.mod_staff() to service_role;
grant execute on function public.mod_ban(uuid, text, text, timestamptz) to service_role;
grant execute on function public.mod_unban(uuid, text) to service_role;

-- ---------------------------------------------------------------- arena access by permission
create or replace function public.problem_readable(p_problem integer, p_visibility text) returns boolean
language sql stable security definer set search_path = public as $$
  select p_visibility = 'public'
      or public.has_perm(auth.uid(), 'create_problems') or public.has_perm(auth.uid(), 'host_contests')
      or exists (select 1 from public.contest_problems cp join public.contests c on c.id = cp.contest_id
                 where cp.problem_id = p_problem and c.starts_at <= now());
$$;

create or replace function public.get_contest_problems(p_contest integer)
returns table (letter text, problem_id integer, title text, rating integer, tags text[], time_limit_ms integer)
language sql stable security definer set search_path = public as $$
  select cp.letter, pr.id, pr.title, pr.rating, pr.tags, pr.time_limit_ms
  from public.contest_problems cp join public.problems pr on pr.id = cp.problem_id
  where cp.contest_id = p_contest and (public.contest_started(p_contest) or public.has_perm(auth.uid(), 'create_problems') or public.has_perm(auth.uid(), 'host_contests'))
  order by cp.letter;
$$;
grant execute on function public.get_contest_problems(integer) to anon, authenticated;

drop policy if exists contest_problems_read on public.contest_problems;
create policy contest_problems_read on public.contest_problems for select to anon, authenticated
  using (public.contest_started(contest_id) or public.has_perm(auth.uid(), 'create_problems') or public.has_perm(auth.uid(), 'host_contests'));

-- Code of others: view_code permission (was: any staff)
create or replace function public.get_submission(p_id bigint)
returns table (id bigint, user_id uuid, username text, rating integer, problem_id integer, problem_title text, contest_id integer,
               verdict text, failed_test integer, tests_total integer, time_ms integer, created_at timestamptz,
               code text, can_view_code boolean, language text)
language sql stable security definer set search_path = public as $$
  select s.id, s.user_id, p.username::text, p.rating, s.problem_id, pr.title, s.contest_id, s.verdict, s.failed_test,
    s.tests_total, s.time_ms, s.created_at,
    case when v.ok then s.code end, v.ok, s.language
  from public.submissions s
  join public.profiles p on p.id = s.user_id
  join public.problems pr on pr.id = s.problem_id
  cross join lateral (select (
      -- your own code
      s.user_id = auth.uid()
      -- staff: Founder, Co-Founder, Admin (and not banned)
      or public.has_perm(auth.uid(), 'view_code')
      -- everyone else: only after solving the problem yourself, and never while
      -- a round that contains this problem is running
      or (exists (select 1 from public.submissions m where m.user_id = auth.uid() and m.problem_id = s.problem_id and m.verdict = 'OK')
          and not exists (select 1 from public.contest_problems cp join public.contests c on c.id = cp.contest_id
                          where cp.problem_id = s.problem_id
                            and c.starts_at <= now()
                            and c.starts_at + make_interval(mins => c.duration_minutes) > now())
          and not exists (select 1 from public.contests c where c.id = s.contest_id
                          and c.starts_at + make_interval(mins => c.duration_minutes) > now()))
    ) as ok) v
  where s.id = p_id and public.problem_readable(pr.id, pr.visibility);
$$;
grant execute on function public.get_submission(bigint) to anon, authenticated;
