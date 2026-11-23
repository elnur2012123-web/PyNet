-- Free plan: up to 5 saved snippets. Pro/Max: unlimited.
-- Enforced in the database so it cannot be bypassed from the browser.
create or replace function public.enforce_saved_code_limit()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_plan text; v_count int;
begin
  select case
           when s.status in ('active','on_trial','past_due') then s.plan
           when s.status = 'cancelled' and s.current_period_end > now() then s.plan
           else 'FREE' end
    into v_plan
  from public.subscriptions s where s.user_id = new.user_id;
  if coalesce(v_plan, 'FREE') = 'FREE' then
    select count(*) into v_count from public.saved_code where user_id = new.user_id;
    if v_count >= 5 then
      raise exception 'Free plan can save up to 5 snippets. Upgrade to Pro for unlimited snippets.';
    end if;
  end if;
  return new;
end $$;

create trigger saved_code_limit before insert on public.saved_code
  for each row execute function public.enforce_saved_code_limit();

-- Keep the profile theme guard consistent with the same rule.
create or replace function public.enforce_profile_plan()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_plan text;
begin
  if new.accent_theme is distinct from old.accent_theme and new.accent_theme <> 'default' then
    select case
             when s.status in ('active','on_trial','past_due') then s.plan
             when s.status = 'cancelled' and s.current_period_end > now() then s.plan
             else 'FREE' end
      into v_plan
    from public.subscriptions s where s.user_id = new.id;
    if coalesce(v_plan, 'FREE') = 'FREE' then
      raise exception 'Profile themes require a Pro or Max plan';
    end if;
  end if;
  return new;
end $$;
