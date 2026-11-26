-- Plans given by hand (for payments made outside the site, e.g. a Click or Payme transfer).
-- A manual plan is stored like a subscription that won't renew: status 'cancelled',
-- payment_provider 'manual' and current_period_end = when it runs out. Everything that
-- checks plans already treats that as "paid until current_period_end", so it expires
-- on its own. Only staff with the new "give_plans" permission can give one.

create or replace function public.all_permissions() returns text[] language sql immutable as $$
  select array['ban_users','view_logs','view_code','host_contests','create_problems','edit_problems','review_cheating','manage_roles','read_suggestions','give_plans'];
$$;
update public.roles set permissions = public.all_permissions() where id = 'founder';

-- Expired manual plans become Free for good (so badges and lists stop showing them).
-- Called by the daily cron job and whenever staff open the plans list.
create or replace function public.expire_manual_plans() returns integer
language plpgsql security definer set search_path = public as $$
declare v_n integer;
begin
  update public.subscriptions
     set plan = 'FREE', status = 'active', billing_interval = null, cancel_at_period_end = false
   where payment_provider = 'manual' and plan <> 'FREE' and current_period_end <= now();
  get diagnostics v_n = row_count;
  return v_n;
end $$;
revoke all on function public.expire_manual_plans() from public, anon, authenticated;
grant execute on function public.expire_manual_plans() to service_role;
