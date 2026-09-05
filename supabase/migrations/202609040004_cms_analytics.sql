-- Barnx CMS privacy-conscious first-party analytics
-- Stores anonymous session activity without names, emails or network addresses.

begin;

create table if not exists public.analytics_events (
  id bigint generated always as identity primary key,
  visitor_id uuid not null,
  session_id uuid not null,
  event_name text not null check (event_name in ('page_view', 'project_open', 'resource_open', 'download', 'external_click')),
  pathname text not null check (char_length(pathname) between 1 and 500),
  target text check (target is null or char_length(target) <= 500),
  referrer_host text check (referrer_host is null or char_length(referrer_host) <= 255),
  country_code text check (country_code is null or country_code ~ '^[A-Z]{2}$'),
  device_type text not null default 'unknown' check (device_type in ('desktop', 'mobile', 'tablet', 'unknown')),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists analytics_events_created_at_idx on public.analytics_events (created_at desc);
create index if not exists analytics_events_path_created_idx on public.analytics_events (pathname, created_at desc);
create index if not exists analytics_events_session_created_idx on public.analytics_events (session_id, created_at desc);

alter table public.analytics_events enable row level security;

drop policy if exists "CMS admins can view analytics" on public.analytics_events;
create policy "CMS admins can view analytics"
on public.analytics_events for select
to authenticated
using (public.is_cms_admin());

revoke all on table public.analytics_events from anon, authenticated;
grant select on table public.analytics_events to authenticated;

create or replace function public.record_analytics_event(
  p_visitor_id uuid,
  p_session_id uuid,
  p_event_name text,
  p_pathname text,
  p_target text default null,
  p_referrer_host text default null,
  p_country_code text default null,
  p_device_type text default 'unknown'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_event_name not in ('page_view', 'project_open', 'resource_open', 'download', 'external_click') then
    raise exception 'Unsupported analytics event';
  end if;
  insert into public.analytics_events (visitor_id, session_id, event_name, pathname, target, referrer_host, country_code, device_type)
  values (
    p_visitor_id, p_session_id, p_event_name, left(p_pathname, 500),
    nullif(left(coalesce(p_target, ''), 500), ''), nullif(left(coalesce(p_referrer_host, ''), 255), ''),
    case when p_country_code ~ '^[A-Z]{2}$' then p_country_code else null end,
    case when p_device_type in ('desktop', 'mobile', 'tablet', 'unknown') then p_device_type else 'unknown' end
  );
end;
$$;

revoke all on function public.record_analytics_event(uuid, uuid, text, text, text, text, text, text) from public;
grant execute on function public.record_analytics_event(uuid, uuid, text, text, text, text, text, text) to anon, authenticated;

commit;
