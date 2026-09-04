-- Barnx CMS media storage
-- Creates a public delivery bucket while keeping every write operation behind
-- the authenticated CMS admin allowlist.

begin;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'cms-media',
  'cms-media',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "CMS admins can view media objects" on storage.objects;
create policy "CMS admins can view media objects"
on storage.objects for select
to authenticated
using (bucket_id = 'cms-media' and public.is_cms_admin());

drop policy if exists "CMS admins can upload media objects" on storage.objects;
create policy "CMS admins can upload media objects"
on storage.objects for insert
to authenticated
with check (bucket_id = 'cms-media' and public.is_cms_admin());

drop policy if exists "CMS admins can update media objects" on storage.objects;
create policy "CMS admins can update media objects"
on storage.objects for update
to authenticated
using (bucket_id = 'cms-media' and public.is_cms_admin())
with check (bucket_id = 'cms-media' and public.is_cms_admin());

drop policy if exists "CMS admins can delete media objects" on storage.objects;
create policy "CMS admins can delete media objects"
on storage.objects for delete
to authenticated
using (bucket_id = 'cms-media' and public.is_cms_admin());

commit;
