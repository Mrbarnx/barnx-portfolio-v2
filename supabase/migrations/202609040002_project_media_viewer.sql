-- Barnx CMS project galleries and privacy-safe external video demos

begin;

alter table public.projects
  add column demo_visibility text not null default 'none'
    check (demo_visibility in ('none', 'public', 'unlisted', 'private')),
  add column demo_video_url text,
  add column demo_video_title text not null default '';

alter table public.projects
  add constraint projects_demo_video_visibility_check check (
    (demo_visibility in ('public', 'unlisted') and nullif(btrim(demo_video_url), '') is not null)
    or
    (demo_visibility in ('none', 'private') and demo_video_url is null)
  ),
  add constraint projects_demo_video_https_check check (
    demo_video_url is null or demo_video_url ~ '^https://'
  );

comment on column public.projects.demo_visibility is
  'Controls the public demo experience. Private demo URLs are never stored on this publicly readable row.';

create table public.project_private_demos (
  project_id uuid primary key references public.projects(id) on delete cascade,
  video_url text check (video_url is null or video_url ~ '^https://'),
  notes text not null default '',
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

comment on table public.project_private_demos is
  'Admin-only external demo links for confidential work. This table has no anonymous API privilege or public RLS policy.';

create trigger project_private_demos_set_updated_at
before update on public.project_private_demos
for each row execute function public.set_updated_at();

alter table public.project_private_demos enable row level security;

create policy "CMS admins can manage private project demos"
on public.project_private_demos for all
to authenticated
using (public.is_cms_admin())
with check (public.is_cms_admin());

revoke all on table public.project_private_demos from anon;
grant select, insert, update, delete on table public.project_private_demos to authenticated;

commit;
