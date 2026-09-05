-- Barnx Studio editable categories
-- Separates top-level Studio navigation cards from the resources inside them.

begin;

create table if not exists public.studio_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null,
  label text not null,
  description text not null,
  icon text not null default '',
  action_label text not null default 'Explore →',
  href text,
  access_type text not null default 'free' check (access_type in ('free', 'premium', 'mixed')),
  published boolean not null default false,
  sort_order integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.studio_resources add column if not exists category_id uuid references public.studio_categories(id) on delete set null;

create index if not exists studio_categories_public_order_idx on public.studio_categories (published, sort_order);
create index if not exists studio_resources_category_idx on public.studio_resources (category_id, published, sort_order);

drop trigger if exists studio_categories_set_updated_at on public.studio_categories;
create trigger studio_categories_set_updated_at before update on public.studio_categories
for each row execute function public.set_updated_at();

alter table public.studio_categories enable row level security;

drop policy if exists "Published Studio categories are publicly readable" on public.studio_categories;
create policy "Published Studio categories are publicly readable" on public.studio_categories for select
to anon, authenticated using (published);

drop policy if exists "CMS admins can manage Studio categories" on public.studio_categories;
create policy "CMS admins can manage Studio categories" on public.studio_categories for all
to authenticated using (public.is_cms_admin()) with check (public.is_cms_admin());

grant select on table public.studio_categories to anon;
grant select, insert, update, delete on table public.studio_categories to authenticated;

commit;
