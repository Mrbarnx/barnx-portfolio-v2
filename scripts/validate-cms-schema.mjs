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

console.log(`CMS schema and API permission validation passed for ${tables.length} tables.`);
