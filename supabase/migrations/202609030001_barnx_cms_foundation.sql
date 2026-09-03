-- Barnx CMS foundation
-- Phase 2 defines the data and security model only. The public site remains
-- file-backed until the admin and migration phases are ready.

begin;

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.set_published_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.published and new.published_at is null then
    new.published_at = timezone('utc', now());
  elsif not new.published then
    new.published_at = null;
  end if;

  return new;
end;
$$;

create table public.cms_admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default timezone('utc', now())
);

comment on table public.cms_admin_users is
  'Explicit allowlist for Barnx CMS administrators. The first owner is added manually after Supabase Auth setup.';

alter table public.cms_admin_users enable row level security;

create or replace function public.is_cms_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.cms_admin_users
    where user_id = auth.uid()
  );
$$;

revoke all on function public.is_cms_admin() from public;
grant execute on function public.is_cms_admin() to authenticated;

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique,
  file_name text not null,
  mime_type text not null,
  alt_text text not null default '',
  caption text,
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  size_bytes bigint check (size_bytes is null or size_bytes >= 0),
  is_public boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

comment on table public.media_assets is
  'Metadata for reusable images, videos, documents and downloadable files. Supabase Storage policies are added in Phase 5.';

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null,
  display_title text not null,
  category text not null,
  status text not null check (status in ('in_development', 'public_build', 'private_demo', 'completed', 'archived')),
  short_summary text not null,
  overview text not null,
  visual_subtitle text not null default '',
  tone text not null default 'light' check (tone in ('light', 'gray', 'black')),
  problem text not null,
  solution text not null,
  role text not null,
  features text[] not null default '{}',
  technologies text[] not null default '{}',
  challenges text not null default '',
  lessons text not null default '',
  live_url text,
  github_url text,
  featured boolean not null default false,
  published boolean not null default false,
  published_at timestamptz,
  sort_order integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (not published or published_at is not null)
);

create table public.project_media (
  project_id uuid not null references public.projects(id) on delete cascade,
  media_id uuid not null references public.media_assets(id) on delete cascade,
  usage text not null check (usage in ('cover', 'screenshot', 'video', 'social_image')),
  sort_order integer not null default 0,
  primary key (project_id, media_id, usage)
);

create table public.impact_stories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null,
  summary text not null,
  business_context text not null,
  original_request text not null,
  discovered_problem text not null,
  recommendation text not null,
  solution text not null,
  system_flow text[] not null default '{}',
  decisions text[] not null default '{}',
  capability_enabled text not null,
  outcome text,
  outcome_evidence text not null check (outcome_evidence in ('measured', 'client_reported', 'enabled', 'proposed')),
  work_type text not null check (work_type in ('client_work', 'company_work', 'independent_case_study', 'open_source', 'public_build', 'free_community_tool')),
  visibility text not null check (visibility in ('confidential', 'client_approved', 'public')),
  status text not null default 'draft' check (status in ('draft', 'in_development', 'completed', 'archived')),
  technologies text[] not null default '{}',
  lessons text[] not null default '{}',
  next_improvements text[] not null default '{}',
  featured boolean not null default false,
  published boolean not null default false,
  published_at timestamptz,
  sort_order integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (not published or published_at is not null),
  check (not published or visibility <> 'confidential')
);

create table public.impact_evidence (
  id uuid primary key default gen_random_uuid(),
  impact_story_id uuid not null references public.impact_stories(id) on delete cascade,
  evidence_type text not null check (evidence_type in ('live', 'repository', 'image', 'video', 'diagram', 'pull_request', 'report', 'testimonial', 'analytics', 'document')),
  label text not null,
  href text,
  media_id uuid references public.media_assets(id) on delete set null,
  approved_for_public boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  check (href is not null or media_id is not null)
);

create table public.studio_resources (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null,
  resource_type text not null check (resource_type in ('guide', 'component', 'workflow', 'prompt_library', 'template', 'blueprint', 'visual_asset', 'other')),
  icon text not null default '',
  short_summary text not null,
  description text not null,
  includes text[] not null default '{}',
  best_for text not null default '',
  technologies text[] not null default '{}',
  is_free boolean not null default true,
  download_path text,
  external_url text,
  cover_media_id uuid references public.media_assets(id) on delete set null,
  featured boolean not null default false,
  published boolean not null default false,
  published_at timestamptz,
  sort_order integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (not published or published_at is not null)
);

create table public.prompt_resources (
  id uuid primary key default gen_random_uuid(),
  number_label text not null default '',
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null,
  category text not null,
  short_summary text not null,
  description text not null,
  best_for text not null default '',
  tools text[] not null default '{}',
  tutorial_steps text[] not null default '{}',
  download_path text,
  source_path text,
  cover_media_id uuid references public.media_assets(id) on delete set null,
  featured boolean not null default false,
  published boolean not null default false,
  published_at timestamptz,
  sort_order integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (not published or published_at is not null)
);

create table public.learning_paths (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null,
  summary text not null,
  description text not null default '',
  difficulty text check (difficulty is null or difficulty in ('beginner', 'intermediate', 'advanced')),
  estimated_duration text,
  cover_media_id uuid references public.media_assets(id) on delete set null,
  featured boolean not null default false,
  published boolean not null default false,
  published_at timestamptz,
  sort_order integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (not published or published_at is not null)
);

create table public.learning_modules (
  id uuid primary key default gen_random_uuid(),
  learning_path_id uuid not null references public.learning_paths(id) on delete cascade,
  title text not null,
  summary text not null default '',
  published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.learning_lessons (
  id uuid primary key default gen_random_uuid(),
  learning_module_id uuid not null references public.learning_modules(id) on delete cascade,
  slug text not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null,
  summary text not null default '',
  body_markdown text not null default '',
  duration_minutes integer check (duration_minutes is null or duration_minutes > 0),
  video_url text,
  repository_url text,
  published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (learning_module_id, slug)
);

create table public.learning_path_resources (
  learning_path_id uuid not null references public.learning_paths(id) on delete cascade,
  studio_resource_id uuid not null references public.studio_resources(id) on delete cascade,
  sort_order integer not null default 0,
  primary key (learning_path_id, studio_resource_id)
);

create table public.site_settings (
  key text primary key check (key ~ '^[a-z0-9]+(?:[._-][a-z0-9]+)*$'),
  value jsonb not null,
  description text not null default '',
  is_public boolean not null default false,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

comment on table public.site_settings is
  'Non-secret portfolio settings. API keys and credentials must remain in environment variables, never in this table.';

create index projects_public_order_idx on public.projects (published, sort_order, published_at desc);
create index projects_featured_idx on public.projects (featured, published, sort_order);
create index project_media_order_idx on public.project_media (project_id, usage, sort_order);
create index impact_stories_public_order_idx on public.impact_stories (published, sort_order, published_at desc);
create index impact_evidence_story_order_idx on public.impact_evidence (impact_story_id, sort_order);
create index studio_resources_public_order_idx on public.studio_resources (published, sort_order, published_at desc);
create index prompt_resources_public_order_idx on public.prompt_resources (published, sort_order, published_at desc);
create index learning_paths_public_order_idx on public.learning_paths (published, sort_order, published_at desc);
create index learning_modules_path_order_idx on public.learning_modules (learning_path_id, sort_order);
create index learning_lessons_module_order_idx on public.learning_lessons (learning_module_id, sort_order);

create trigger media_assets_set_updated_at
before update on public.media_assets
for each row execute function public.set_updated_at();

create trigger projects_set_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

create trigger projects_set_published_at
before insert or update on public.projects
for each row execute function public.set_published_at();

create trigger impact_stories_set_updated_at
before update on public.impact_stories
for each row execute function public.set_updated_at();

create trigger impact_stories_set_published_at
before insert or update on public.impact_stories
for each row execute function public.set_published_at();

create trigger studio_resources_set_updated_at
before update on public.studio_resources
for each row execute function public.set_updated_at();

create trigger studio_resources_set_published_at
before insert or update on public.studio_resources
for each row execute function public.set_published_at();

create trigger prompt_resources_set_updated_at
before update on public.prompt_resources
for each row execute function public.set_updated_at();

create trigger prompt_resources_set_published_at
before insert or update on public.prompt_resources
for each row execute function public.set_published_at();

create trigger learning_paths_set_updated_at
before update on public.learning_paths
for each row execute function public.set_updated_at();

create trigger learning_paths_set_published_at
before insert or update on public.learning_paths
for each row execute function public.set_published_at();

create trigger learning_modules_set_updated_at
before update on public.learning_modules
for each row execute function public.set_updated_at();

create trigger learning_lessons_set_updated_at
before update on public.learning_lessons
for each row execute function public.set_updated_at();

create trigger site_settings_set_updated_at
before update on public.site_settings
for each row execute function public.set_updated_at();

alter table public.media_assets enable row level security;
alter table public.projects enable row level security;
alter table public.project_media enable row level security;
alter table public.impact_stories enable row level security;
alter table public.impact_evidence enable row level security;
alter table public.studio_resources enable row level security;
alter table public.prompt_resources enable row level security;
alter table public.learning_paths enable row level security;
alter table public.learning_modules enable row level security;
alter table public.learning_lessons enable row level security;
alter table public.learning_path_resources enable row level security;
alter table public.site_settings enable row level security;

create policy "Published media is publicly readable"
on public.media_assets for select
to anon, authenticated
using (is_public);

create policy "Published projects are publicly readable"
on public.projects for select
to anon, authenticated
using (published);

create policy "Published project media is publicly readable"
on public.project_media for select
to anon, authenticated
using (
  exists (
    select 1 from public.projects
    where projects.id = project_media.project_id
      and projects.published
  )
);

create policy "Published impact stories are publicly readable"
on public.impact_stories for select
to anon, authenticated
using (published and visibility in ('client_approved', 'public'));

create policy "Approved impact evidence is publicly readable"
on public.impact_evidence for select
to anon, authenticated
using (
  approved_for_public
  and exists (
    select 1 from public.impact_stories
    where impact_stories.id = impact_evidence.impact_story_id
      and impact_stories.published
      and impact_stories.visibility in ('client_approved', 'public')
  )
);

create policy "Published studio resources are publicly readable"
on public.studio_resources for select
to anon, authenticated
using (published);

create policy "Published prompt resources are publicly readable"
on public.prompt_resources for select
to anon, authenticated
using (published);

create policy "Published learning paths are publicly readable"
on public.learning_paths for select
to anon, authenticated
using (published);

create policy "Modules in published learning paths are publicly readable"
on public.learning_modules for select
to anon, authenticated
using (
  published
  and exists (
    select 1 from public.learning_paths
    where learning_paths.id = learning_modules.learning_path_id
      and learning_paths.published
  )
);

create policy "Published lessons in published paths are publicly readable"
on public.learning_lessons for select
to anon, authenticated
using (
  published
  and exists (
    select 1
    from public.learning_modules
    join public.learning_paths on learning_paths.id = learning_modules.learning_path_id
    where learning_modules.id = learning_lessons.learning_module_id
      and learning_modules.published
      and learning_paths.published
  )
);

create policy "Published learning resources are publicly readable"
on public.learning_path_resources for select
to anon, authenticated
using (
  exists (
    select 1 from public.learning_paths
    where learning_paths.id = learning_path_resources.learning_path_id
      and learning_paths.published
  )
  and exists (
    select 1 from public.studio_resources
    where studio_resources.id = learning_path_resources.studio_resource_id
      and studio_resources.published
  )
);

create policy "Public site settings are readable"
on public.site_settings for select
to anon, authenticated
using (is_public);

create policy "CMS admins can read the admin allowlist"
on public.cms_admin_users for select
to authenticated
using (public.is_cms_admin());

create policy "CMS admins can manage media"
on public.media_assets for all
to authenticated
using (public.is_cms_admin())
with check (public.is_cms_admin());

create policy "CMS admins can manage projects"
on public.projects for all
to authenticated
using (public.is_cms_admin())
with check (public.is_cms_admin());

create policy "CMS admins can manage project media"
on public.project_media for all
to authenticated
using (public.is_cms_admin())
with check (public.is_cms_admin());

create policy "CMS admins can manage impact stories"
on public.impact_stories for all
to authenticated
using (public.is_cms_admin())
with check (public.is_cms_admin());

create policy "CMS admins can manage impact evidence"
on public.impact_evidence for all
to authenticated
using (public.is_cms_admin())
with check (public.is_cms_admin());

create policy "CMS admins can manage studio resources"
on public.studio_resources for all
to authenticated
using (public.is_cms_admin())
with check (public.is_cms_admin());

create policy "CMS admins can manage prompt resources"
on public.prompt_resources for all
to authenticated
using (public.is_cms_admin())
with check (public.is_cms_admin());

create policy "CMS admins can manage learning paths"
on public.learning_paths for all
to authenticated
using (public.is_cms_admin())
with check (public.is_cms_admin());

create policy "CMS admins can manage learning modules"
on public.learning_modules for all
to authenticated
using (public.is_cms_admin())
with check (public.is_cms_admin());

create policy "CMS admins can manage learning lessons"
on public.learning_lessons for all
to authenticated
using (public.is_cms_admin())
with check (public.is_cms_admin());

create policy "CMS admins can manage learning resources"
on public.learning_path_resources for all
to authenticated
using (public.is_cms_admin())
with check (public.is_cms_admin());

create policy "CMS admins can manage site settings"
on public.site_settings for all
to authenticated
using (public.is_cms_admin())
with check (public.is_cms_admin());

commit;
