-- Barnx CMS explicit Data API permissions
-- New tables are not exposed automatically. This migration grants only the
-- table privileges required by public readers and authenticated CMS admins;
-- Row Level Security remains the final authorization layer.

begin;

grant usage on schema public to anon, authenticated;

grant select on table
  public.media_assets,
  public.projects,
  public.project_media,
  public.impact_stories,
  public.impact_evidence,
  public.studio_resources,
  public.prompt_resources,
  public.learning_paths,
  public.learning_modules,
  public.learning_lessons,
  public.learning_path_resources,
  public.site_settings
to anon;

grant select on table public.cms_admin_users to authenticated;

grant select, insert, update, delete on table
  public.media_assets,
  public.projects,
  public.project_media,
  public.impact_stories,
  public.impact_evidence,
  public.studio_resources,
  public.prompt_resources,
  public.learning_paths,
  public.learning_modules,
  public.learning_lessons,
  public.learning_path_resources,
  public.site_settings
to authenticated;

revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.set_published_at() from public, anon, authenticated;

commit;
