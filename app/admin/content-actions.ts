'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireCmsAdmin } from '@/lib/admin/requireCmsAdmin';
import { resources as fileResources } from '@/data/content';
import { promptLibrary as filePrompts } from '@/data/prompts';
import { studioCategories as fileStudioCategories } from '@/data/studio';
import { readPromptSource } from '@/lib/cms/promptFiles';

const slug = z.string().trim().min(2).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const url = z.string().trim().refine((value) => !value || z.string().url().safeParse(value).success);
const text = (minimum = 2) => z.string().trim().min(minimum);
const lines = (value: FormDataEntryValue | null) => String(value ?? '').split(/[,\n]/).map((item) => item.trim()).filter(Boolean);
const nullable = (value: FormDataEntryValue | null) => String(value ?? '').trim() || null;
const checked = (data: FormData, key: string) => data.get(key) === 'on';
const publishedAt = (published: boolean) => published ? new Date().toISOString() : null;

export async function saveStudioResource(data: FormData) {
  const schema = z.object({ id: z.string(), title: text(), slug, resource_type: z.enum(['guide','component','workflow','prompt_library','template','blueprint','visual_asset','other']), category_id: z.string(), icon: z.string(), short_summary: text(10), description: text(10), best_for: z.string(), download_path: z.string(), external_url: url, sort_order: z.coerce.number().int().min(0) });
  const parsed = schema.safeParse(Object.fromEntries(data));
  if (!parsed.success) redirect(`/admin/studio?error=resource`);
  const { supabase, user } = await requireCmsAdmin();
  const publish = data.get('intent') === 'publish';
  const payload = { ...parsed.data, id: undefined, category_id: parsed.data.category_id || null, includes: lines(data.get('includes')), technologies: lines(data.get('technologies')), is_free: checked(data,'is_free'), featured: checked(data,'featured'), published: publish, published_at: publishedAt(publish), download_path: nullable(data.get('download_path')), external_url: nullable(data.get('external_url')) };
  const query = parsed.data.id ? supabase.from('studio_resources').update(payload).eq('id', parsed.data.id) : supabase.from('studio_resources').insert({ ...payload, created_by: user.id });
  const { data: saved, error } = await query.select('id').single();
  if (error) redirect(`/admin/studio?error=resource-save`);
  revalidatePath('/barnx-studio'); revalidatePath(`/barnx-studio/${parsed.data.slug}`); revalidatePath('/admin/studio');
  redirect(`/admin/studio/resources/${saved.id}?saved=${publish ? 'published' : 'draft'}`);
}

export async function savePromptResource(data: FormData) {
  const schema = z.object({ id: z.string(), number_label: z.string(), title: text(), slug, category: text(), short_summary: text(10), description: text(10), best_for: z.string(), download_path: z.string(), source_path: z.string(), prompt_text: text(10), sort_order: z.coerce.number().int().min(0) });
  const parsed = schema.safeParse(Object.fromEntries(data));
  if (!parsed.success) redirect('/admin/studio?error=prompt');
  const { supabase, user } = await requireCmsAdmin(); const publish = data.get('intent') === 'publish';
  const payload = { ...parsed.data, id: undefined, tools: lines(data.get('tools')), tutorial_steps: lines(data.get('tutorial_steps')), featured: checked(data,'featured'), published: publish, published_at: publishedAt(publish), download_path: nullable(data.get('download_path')), source_path: nullable(data.get('source_path')) };
  const query = parsed.data.id ? supabase.from('prompt_resources').update(payload).eq('id', parsed.data.id) : supabase.from('prompt_resources').insert({ ...payload, created_by: user.id });
  const { data: saved, error } = await query.select('id').single();
  if (error) redirect('/admin/studio?error=prompt-save');
  revalidatePath('/barnx-studio/prompts'); revalidatePath(`/barnx-studio/prompts/${parsed.data.slug}`); revalidatePath('/admin/studio');
  redirect(`/admin/studio/prompts/${saved.id}?saved=${publish ? 'published' : 'draft'}`);
}

export async function saveLearningPath(data: FormData) {
  const schema = z.object({ id: z.string(), title: text(), slug, summary: text(10), description: z.string(), difficulty: z.enum(['','beginner','intermediate','advanced']), estimated_duration: z.string(), sort_order: z.coerce.number().int().min(0) });
  const parsed = schema.safeParse(Object.fromEntries(data)); if (!parsed.success) redirect('/admin/learning-paths?error=path');
  const { supabase, user } = await requireCmsAdmin(); const publish = data.get('intent') === 'publish';
  const payload = { ...parsed.data, id: undefined, difficulty: parsed.data.difficulty || null, estimated_duration: nullable(data.get('estimated_duration')), featured: checked(data,'featured'), published: publish, published_at: publishedAt(publish) };
  const query = parsed.data.id ? supabase.from('learning_paths').update(payload).eq('id', parsed.data.id) : supabase.from('learning_paths').insert({ ...payload, created_by: user.id });
  const { data: saved, error } = await query.select('id').single(); if (error) redirect('/admin/learning-paths?error=path-save');
  revalidatePath('/admin/learning-paths'); revalidatePath('/barnx-studio/learning-paths'); revalidatePath(`/barnx-studio/learning-paths/${parsed.data.slug}`);
  redirect(`/admin/learning-paths/${saved.id}?saved=${publish ? 'published' : 'draft'}`);
}

export async function saveLearningModule(data: FormData) {
  const { supabase } = await requireCmsAdmin(); const id=String(data.get('id')??''); const pathId=String(data.get('learning_path_id')??'');
  const payload={ learning_path_id:pathId, title:String(data.get('title')??'').trim(), summary:String(data.get('summary')??'').trim(), published:checked(data,'published'), sort_order:Number(data.get('sort_order')??0) };
  if (!pathId || !payload.title) redirect(`/admin/learning-paths/${pathId}?error=module`);
  const query=id?supabase.from('learning_modules').update(payload).eq('id',id):supabase.from('learning_modules').insert(payload);
  const {error}=await query; revalidatePath(`/admin/learning-paths/${pathId}`); revalidatePath('/barnx-studio/learning-paths');
  redirect(`/admin/learning-paths/${pathId}?module=${error?'failed':'saved'}`);
}

export async function saveLearningLesson(data: FormData) {
  const { supabase }=await requireCmsAdmin(); const id=String(data.get('id')??''); const pathId=String(data.get('learning_path_id')??''); const moduleId=String(data.get('learning_module_id')??'');
  const parsed=z.object({slug,title:text(),summary:z.string(),body_markdown:z.string(),duration_minutes:z.string(),video_url:url,repository_url:url,sort_order:z.coerce.number().int().min(0)}).safeParse(Object.fromEntries(data));
  if(!parsed.success) redirect(`/admin/learning-paths/${pathId}?error=lesson`);
  const payload={...parsed.data,learning_module_id:moduleId,duration_minutes:parsed.data.duration_minutes?Number(parsed.data.duration_minutes):null,video_url:nullable(data.get('video_url')),repository_url:nullable(data.get('repository_url')),published:checked(data,'published')};
  const query=id?supabase.from('learning_lessons').update(payload).eq('id',id):supabase.from('learning_lessons').insert(payload); const {error}=await query;
  revalidatePath(`/admin/learning-paths/${pathId}`); revalidatePath('/barnx-studio/learning-paths');
  redirect(`/admin/learning-paths/${pathId}?lesson=${error?'failed':'saved'}`);
}

export async function saveImpactStory(data: FormData) {
  const schema=z.object({id:z.string(),slug,title:text(),summary:text(10),business_context:text(10),original_request:text(10),discovered_problem:text(10),recommendation:text(10),solution:text(10),capability_enabled:text(5),outcome:z.string(),outcome_evidence:z.enum(['measured','client_reported','enabled','proposed']),work_type:z.enum(['client_work','company_work','independent_case_study','open_source','public_build','free_community_tool']),visibility:z.enum(['confidential','client_approved','public']),status:z.enum(['draft','in_development','completed','archived']),sort_order:z.coerce.number().int().min(0)});
  const parsed=schema.safeParse(Object.fromEntries(data)); if(!parsed.success) redirect('/admin/impact?error=story');
  const {supabase,user}=await requireCmsAdmin(); const requested=data.get('intent')==='publish'; const publish=requested&&parsed.data.visibility!=='confidential'&&parsed.data.status!=='archived';
  const payload={...parsed.data,id:undefined,system_flow:lines(data.get('system_flow')),decisions:lines(data.get('decisions')),technologies:lines(data.get('technologies')),lessons:lines(data.get('lessons')),next_improvements:lines(data.get('next_improvements')),outcome:nullable(data.get('outcome')),featured:checked(data,'featured'),published:publish,published_at:publishedAt(publish)};
  const query=parsed.data.id?supabase.from('impact_stories').update(payload).eq('id',parsed.data.id):supabase.from('impact_stories').insert({...payload,created_by:user.id}); const {data:saved,error}=await query.select('id').single();
  if(error) redirect('/admin/impact?error=story-save'); revalidatePath('/admin/impact');revalidatePath('/impact');revalidatePath(`/impact/${parsed.data.slug}`);
  redirect(`/admin/impact/${saved.id}?saved=${publish?'published':'draft'}${requested&&!publish?'&guarded=true':''}`);
}

export async function saveImpactEvidence(data: FormData) {
  const {supabase}=await requireCmsAdmin(); const id=String(data.get('id')??''); const storyId=String(data.get('impact_story_id')??''); const href=nullable(data.get('href')); const mediaId=nullable(data.get('media_id'));
  if(!storyId||(!href&&!mediaId)) redirect(`/admin/impact/${storyId}?error=evidence`);
  const payload={impact_story_id:storyId,evidence_type:String(data.get('evidence_type')),label:String(data.get('label')).trim(),href,media_id:mediaId,approved_for_public:checked(data,'approved_for_public'),sort_order:Number(data.get('sort_order')??0)};
  const query=id?supabase.from('impact_evidence').update(payload).eq('id',id):supabase.from('impact_evidence').insert(payload); const {error}=await query;
  revalidatePath(`/admin/impact/${storyId}`);revalidatePath('/impact');redirect(`/admin/impact/${storyId}?evidence=${error?'failed':'saved'}`);
}

export async function saveSiteSettings(data: FormData) {
  const settings={headline:String(data.get('headline')??'').trim(),availability:String(data.get('availability')??'').trim(),email:String(data.get('email')??'').trim(),github:String(data.get('github')??'').trim(),linkedin:String(data.get('linkedin')??'').trim(),x:String(data.get('x')??'').trim(),tiktok:String(data.get('tiktok')??'').trim(),location:String(data.get('location')??'').trim(),resumeUrl:String(data.get('resumeUrl')??'').trim(),seoTitle:String(data.get('seoTitle')??'').trim(),seoDescription:String(data.get('seoDescription')??'').trim()};
  const schema=z.object({headline:text(10),availability:text(3),email:z.string().email(),github:z.string().url(),linkedin:z.string().url(),x:z.string().url(),tiktok:z.string().url(),location:text(2),resumeUrl:text(2),seoTitle:text(3),seoDescription:text(10)});
  if(!schema.safeParse(settings).success) redirect('/admin/settings?error=validation');
  const {supabase,user}=await requireCmsAdmin(); const {error}=await supabase.from('site_settings').upsert({key:'site.profile',value:settings,description:'Public portfolio identity, links and metadata.',is_public:true,updated_by:user.id});
  revalidatePath('/');revalidatePath('/admin/settings');revalidatePath('/sitemap.xml');redirect(`/admin/settings?saved=${error?'failed':'true'}`);
}

export async function importCurrentStudioResources() {
  const { supabase, user } = await requireCmsAdmin();
  const { data: existing, error: readError } = await supabase.from('studio_resources').select('slug');
  if (readError) redirect('/admin/studio?import=failed');
  const existingSlugs = new Set((existing ?? []).map((item) => item.slug));
  const typeMap: Record<string, string> = {
    Guide: 'guide', Component: 'component', Workflow: 'workflow',
    'Prompt Library': 'prompt_library', Template: 'template',
  };
  const rows = fileResources.filter((item) => !existingSlugs.has(item.slug)).map((item, index) => ({
    slug: item.slug, title: item.title, resource_type: typeMap[item.type] ?? 'other', icon: item.icon,
    short_summary: item.short, description: item.description, includes: item.includes,
    best_for: item.bestFor, technologies: item.tech, is_free: item.free,
    download_path: item.download ?? null, featured: index < 3, published: true,
    published_at: new Date().toISOString(), sort_order: index, created_by: user.id,
  }));
  if (!rows.length) redirect('/admin/studio?import=unchanged');
  const { error } = await supabase.from('studio_resources').insert(rows);
  revalidatePath('/admin/studio'); revalidatePath('/barnx-studio');
  redirect(`/admin/studio?import=${error ? 'failed' : 'resources'}`);
}

export async function importCurrentPrompts() {
  const { supabase, user } = await requireCmsAdmin();
  const { data: existing, error: readError } = await supabase.from('prompt_resources').select('slug');
  if (readError) redirect('/admin/studio?import=failed');
  const existingSlugs = new Set((existing ?? []).map((item) => item.slug));
  const rows = filePrompts.filter((item) => !existingSlugs.has(item.slug)).map((item, index) => ({
    number_label: item.number, slug: item.slug, title: item.title, category: item.category,
    short_summary: item.short, description: item.description, best_for: item.bestFor,
    tools: item.tools, tutorial_steps: item.tutorial, download_path: item.download,
    source_path: item.sourceFile, prompt_text: readPromptSource(item.slug),
    featured: index === 0, published: true, published_at: new Date().toISOString(),
    sort_order: index, created_by: user.id,
  }));
  if (rows.some((item) => !item.prompt_text)) redirect('/admin/studio?import=prompt-files');
  if (!rows.length) redirect('/admin/studio?import=unchanged');
  const { error } = await supabase.from('prompt_resources').insert(rows);
  revalidatePath('/admin/studio'); revalidatePath('/barnx-studio/prompts');
  redirect(`/admin/studio?import=${error ? 'failed' : 'prompts'}`);
}

export async function saveStudioCategory(data: FormData) {
  const parsed = z.object({ id: z.string(), slug, title: text(), label: text(), description: text(10), icon: z.string(), action_label: text(), href: z.string(), access_type: z.enum(['free','premium','mixed']), sort_order: z.coerce.number().int().min(0) }).safeParse(Object.fromEntries(data));
  if (!parsed.success) redirect('/admin/studio?error=category');
  const { supabase, user } = await requireCmsAdmin();
  const payload = { ...parsed.data, id: undefined, href: nullable(data.get('href')), published: data.get('intent') === 'publish' };
  const query = parsed.data.id ? supabase.from('studio_categories').update(payload).eq('id', parsed.data.id) : supabase.from('studio_categories').insert({ ...payload, created_by: user.id });
  const { data: saved, error } = await query.select('id').single();
  if (error) redirect('/admin/studio?error=category-save');
  revalidatePath('/admin/studio'); revalidatePath('/barnx-studio');
  redirect(`/admin/studio/categories/${saved.id}?saved=${payload.published ? 'published' : 'draft'}`);
}

export async function importCurrentStudioCategories() {
  const { supabase, user } = await requireCmsAdmin();
  const { data: existing, error: readError } = await supabase.from('studio_categories').select('slug');
  if (readError) redirect('/admin/studio?import=category-migration');
  const existingSlugs = new Set((existing ?? []).map((item) => item.slug));
  const missing = fileStudioCategories.filter((item) => !existingSlugs.has(item.slug)).map((item, index) => ({
    slug: item.slug, title: item.title, label: item.meta.split(' · ')[0], description: item.short,
    icon: item.icon, action_label: item.action, href: item.href, access_type: item.access,
    published: true, sort_order: index, created_by: user.id,
  }));
  if (missing.length) {
    const { error } = await supabase.from('studio_categories').insert(missing);
    if (error) redirect('/admin/studio?import=failed');
  }
  const { data: categories } = await supabase.from('studio_categories').select('id,slug');
  const bySlug = new Map((categories ?? []).map((item) => [item.slug, item.id]));
  const assignments: Record<string, string> = {
    'frontend-release-checklist': 'open-source-assets', 'react-async-button': 'open-source-assets',
    'vue-resource-card': 'open-source-assets', 'n8n-lead-follow-up': 'automation-blueprints',
    'prompt-library': 'prompt-library', 'saas-starter-system': 'saas-starter-system',
  };
  await Promise.all(Object.entries(assignments).map(([resourceSlug, categorySlug]) => {
    const categoryId = bySlug.get(categorySlug);
    return categoryId ? supabase.from('studio_resources').update({ category_id: categoryId }).eq('slug', resourceSlug) : Promise.resolve();
  }));
  revalidatePath('/admin/studio'); revalidatePath('/barnx-studio');
  redirect(`/admin/studio?import=${missing.length ? 'categories' : 'unchanged'}`);
}
