# Barnx CMS — Phase 2 data model

Phase 2 adds the database and security blueprint for the future Barnx Admin. It does **not** switch the live website from its current TypeScript data files to Supabase.

That boundary is intentional: the production portfolio stays stable until authentication, content migration and fallback behavior have each been tested.

## Data model

| Area | Tables | Purpose |
|---|---|---|
| Admin access | `cms_admin_users` | Explicit allowlist linked to Supabase Auth users |
| Media library | `media_assets` | Reusable metadata for public portfolio images and future downloadable files |
| Projects | `projects`, `project_media`, `project_private_demos` | Draft/published projects, ordered image galleries, external demos and private access records |
| Impact Stories | `impact_stories`, `impact_evidence` | Evidence-first stories with visibility and publication controls |
| Barnx Studio | `studio_resources`, `prompt_resources` | Guides, individual prompts, components, workflows, templates and assets |
| Learning | `learning_paths`, `learning_modules`, `learning_lessons`, `learning_path_resources` | Ordered learning content and related downloads |
| Site settings | `site_settings` | Non-secret public configuration that may later be editable in Admin |

## Security rules

- Public visitors can read only rows marked as published.
- Confidential Impact Stories cannot be published.
- Public visitors can see only Impact evidence explicitly approved for public use.
- Drafts and unpublished lessons remain private.
- Content writes require an authenticated user listed in `cms_admin_users`.
- The first admin must be bootstrapped manually after the owner creates a Supabase Auth account.
- Admin allowlist changes stay in the Supabase SQL editor/service role; the browser admin cannot promote another account.
- API keys, service-role keys and other secrets must stay in environment variables, never `site_settings`.
- Storage-object upload policies are deliberately deferred to the Media Library phase.
- External private-demo URLs live only in `project_private_demos`, which has no anonymous table privilege or public read policy.
- Public and unlisted external demos may be embedded only after the visitor actively chooses the video view.

## Existing content mapping

| Current source | Future table |
|---|---|
| `data/content.ts` → `projects` | `projects` |
| `data/content.ts` → `resources` | `studio_resources` |
| `data/prompts.ts` | `prompt_resources` |
| `data/impact.ts` | `impact_stories` and `impact_evidence` |
| Docker Fundamentals page content | `learning_paths`, `learning_modules` and `learning_lessons` |
| Images and downloadable files under `public/` | `media_assets` after the upload phase |

The current `experience` array and tightly designed homepage copy remain code-managed for now. Making every sentence editable would create unnecessary CMS complexity.

## Publication behavior

Content follows a predictable path:

1. Create a draft in Admin.
2. Add text, links and approved media.
3. Review the public preview.
4. Publish it; the database records `published_at` automatically.
5. The public site reads only published records.

Impact Stories add one more gate: confidential work is never publicly readable, and each evidence item must have `approved_for_public = true`.

## Phase boundaries

### Phase 3 — authentication and admin shell

- Create the Supabase project.
- Run the migration.
- Run the explicit Data API permissions migration. Automatic table exposure stays disabled.
- Configure the two public Supabase environment variables.
- Add the owner's Auth user to `cms_admin_users` through the Supabase SQL editor.
- Build `/admin/login` and a protected `/admin` shell.

Example bootstrap statement, run only after replacing the placeholder with the authenticated owner's real UUID:

```sql
insert into public.cms_admin_users (user_id, display_name)
values ('OWNER_AUTH_USER_UUID', 'Barnabas Mikel');
```

### Phase 4 — Projects CMS

- Build project create/edit/draft/publish forms.
- Migrate existing projects from `data/content.ts` once.
- Add a tested database read path to the public Projects pages.
- Keep a controlled rollback path during the migration; do not silently mix stale file data with database data.

### Phase 5 — Media library

- Create the Supabase Storage bucket.
- Add file type and size restrictions.
- Add Storage Row Level Security policies.
- Connect reusable uploaded media to projects and resources.

### Phase 5B — Project media presentation

- Keep a dedicated card cover separate from the ordered project gallery.
- Show full gallery images without cropping on project detail pages.
- Use a controlled wide crop for responsive project cards.
- Accept external YouTube, Vimeo, Loom or secure fallback links instead of uploading video files.
- Keep Images as the default view and mount a video player only after the visitor chooses Watch video.
- Represent confidential work with Request private demo; never expose its stored URL through the public API.

## Runtime fallback

Published project pages now read from Supabase. The original TypeScript project data remains a controlled availability fallback if Supabase is temporarily unavailable or unconfigured.
