import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const migrationPath = new URL(
  '../supabase/migrations/202609030001_barnx_cms_foundation.sql',
  import.meta.url,
);
const sql = readFileSync(migrationPath, 'utf8');
const permissionsPath = new URL(
  '../supabase/migrations/202609030002_cms_api_permissions.sql',
  import.meta.url,
);
const permissionsSql = readFileSync(permissionsPath, 'utf8');
const mediaStoragePath = new URL(
  '../supabase/migrations/202609040001_cms_media_storage.sql',
  import.meta.url,
);
const mediaStorageSql = readFileSync(mediaStoragePath, 'utf8');
const projectMediaPath = new URL(
  '../supabase/migrations/202609040002_project_media_viewer.sql',
  import.meta.url,
);
const projectMediaSql = readFileSync(projectMediaPath, 'utf8');
const studioContentPath = new URL('../supabase/migrations/202609040003_studio_prompt_content.sql', import.meta.url);
const studioContentSql = readFileSync(studioContentPath, 'utf8');
const analyticsPath = new URL('../supabase/migrations/202609040004_cms_analytics.sql', import.meta.url);
const analyticsSql = readFileSync(analyticsPath, 'utf8');
const studioCategoriesPath = new URL('../supabase/migrations/202609050001_studio_categories.sql', import.meta.url);
const studioCategoriesSql = readFileSync(studioCategoriesPath, 'utf8');

const tables = [
  'cms_admin_users',
  'media_assets',
  'projects',
  'project_media',
  'impact_stories',
  'impact_evidence',
  'studio_resources',
  'prompt_resources',
  'learning_paths',
  'learning_modules',
  'learning_lessons',
  'learning_path_resources',
  'site_settings',
];

assert.match(sql, /^-- Barnx CMS foundation/m);
assert.match(sql, /\bbegin;[\s\S]*\bcommit;\s*$/);
assert.equal((sql.match(/\$\$/g) ?? []).length % 2, 0, 'Dollar-quoted function blocks must be paired.');
assert.equal((sql.match(/\(/g) ?? []).length, (sql.match(/\)/g) ?? []).length, 'Parentheses must be balanced.');

for (const table of tables) {
  assert.match(sql, new RegExp(`create table public\\.${table} \\(`), `Missing table: ${table}`);
  assert.match(
    sql,
    new RegExp(`alter table public\\.${table} enable row level security;`),
    `RLS is not enabled for: ${table}`,
  );
}

for (const table of tables.filter((table) => table !== 'cms_admin_users')) {
  assert.match(
    sql,
    new RegExp(`on public\\.${table} for all[\\s\\S]{0,120}public\\.is_cms_admin\\(\\)`),
    `Missing admin write policy for: ${table}`,
  );
}

assert.doesNotMatch(
  sql,
  /manage the admin allowlist/i,
  'The browser-accessible admin role must not be able to promote accounts.',
);
assert.doesNotMatch(sql, /service[_-]?role\s*(key|secret)/i, 'Do not place a service-role secret in a migration.');
assert.match(sql, /not published or visibility <> 'confidential'/);
assert.match(sql, /approved_for_public/);
assert.match(sql, /create or replace function public\.set_published_at\(\)/);

assert.match(permissionsSql, /^-- Barnx CMS explicit Data API permissions/m);
assert.match(permissionsSql, /\bbegin;[\s\S]*\bcommit;\s*$/);
assert.match(permissionsSql, /grant usage on schema public to anon, authenticated;/);
assert.match(permissionsSql, /grant select on table[\s\S]*to anon;/);
assert.match(permissionsSql, /grant select on table public\.cms_admin_users to authenticated;/);
assert.match(permissionsSql, /grant select, insert, update, delete on table[\s\S]*to authenticated;/);
assert.doesNotMatch(
  permissionsSql,
  /grant\s+(insert|update|delete|all)[\s\S]{0,160}\bto anon\b/i,
  'Anonymous users must never receive mutation privileges.',
);

for (const table of tables.filter((table) => table !== 'cms_admin_users')) {
  assert.match(
    permissionsSql,
    new RegExp(`public\\.${table}`),
    `Missing explicit API permission for: ${table}`,
  );
}

assert.match(mediaStorageSql, /^-- Barnx CMS media storage/m);
assert.match(mediaStorageSql, /\bbegin;[\s\S]*\bcommit;\s*$/);
assert.match(mediaStorageSql, /'cms-media',[\s\S]*true,[\s\S]*8388608/);
assert.match(mediaStorageSql, /allowed_mime_types/);
assert.match(mediaStorageSql, /on storage\.objects for insert[\s\S]*public\.is_cms_admin\(\)/);
assert.match(mediaStorageSql, /on storage\.objects for update[\s\S]*public\.is_cms_admin\(\)/);
assert.match(mediaStorageSql, /on storage\.objects for delete[\s\S]*public\.is_cms_admin\(\)/);
assert.doesNotMatch(
  mediaStorageSql,
  /on storage\.objects for (insert|update|delete)[\s\S]{0,160}\bto anon\b/i,
  'Anonymous users must never receive Storage mutation privileges.',
);

assert.match(projectMediaSql, /^-- Barnx CMS project galleries and privacy-safe external video demos/m);
assert.match(projectMediaSql, /demo_visibility in \('none', 'public', 'unlisted', 'private'\)/);
assert.match(projectMediaSql, /create table public\.project_private_demos/);
assert.match(projectMediaSql, /alter table public\.project_private_demos enable row level security;/);
assert.match(projectMediaSql, /revoke all on table public\.project_private_demos from anon;/);
assert.match(projectMediaSql, /public\.is_cms_admin\(\)/);
assert.doesNotMatch(
  projectMediaSql,
  /grant\s+(select|insert|update|delete|all)[\s\S]{0,100}\bto anon\b/i,
  'Anonymous users must never receive access to private project demo links.',
);

assert.match(studioContentSql, /^-- Barnx Studio CMS prompt content/m);
assert.match(studioContentSql, /add column if not exists prompt_text/);
assert.match(analyticsSql, /^-- Barnx CMS privacy-conscious first-party analytics/m);
assert.match(analyticsSql, /create table if not exists public\.analytics_events/);
assert.match(analyticsSql, /alter table public\.analytics_events enable row level security/);
assert.match(analyticsSql, /create or replace function public\.record_analytics_event/);
assert.match(analyticsSql, /security definer/);
assert.match(analyticsSql, /public\.is_cms_admin\(\)/);
assert.doesNotMatch(analyticsSql, /\b(ip|ip_address|email|full_name)\b/i, 'Analytics must not store direct personal identifiers.');

assert.match(studioCategoriesSql, /^-- Barnx Studio editable categories/m);
assert.match(studioCategoriesSql, /create table if not exists public\.studio_categories/);
assert.match(studioCategoriesSql, /studio_resources add column if not exists category_id/);
assert.match(studioCategoriesSql, /alter table public\.studio_categories enable row level security/);
assert.match(studioCategoriesSql, /Published Studio categories are publicly readable/);
assert.match(studioCategoriesSql, /CMS admins can manage Studio categories/);
assert.match(studioCategoriesSql, /public\.is_cms_admin\(\)/);
assert.doesNotMatch(
  studioCategoriesSql,
  /grant\s+(insert|update|delete|all)[\s\S]{0,120}\bto anon\b/i,
  'Anonymous users must never receive Studio category mutation privileges.',
);

console.log(`CMS schema, API permissions, media storage, private demos, Studio categories and phases 6-9 validation passed for ${tables.length} foundation tables.`);
