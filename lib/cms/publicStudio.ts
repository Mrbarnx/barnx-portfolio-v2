import 'server-only';

import { cache } from 'react';
import { createClient } from '@supabase/supabase-js';
import { resources as fallbackResources } from '@/data/content';
import { promptLibrary as fallbackPrompts } from '@/data/prompts';
import { studioCategories as fallbackCategories, type StudioCategory } from '@/data/studio';
import { getSupabaseConfig, hasSupabaseConfig } from '@/lib/supabase/config';

function client() {
  const { url, anonKey } = getSupabaseConfig();
  return createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
}

export type PublicStudioResource = {
  slug: string; title: string; type: string; icon: string; free: boolean; short: string;
  description: string; includes: string[]; bestFor: string; tech: string[]; download?: string; externalUrl?: string;
};

export type PublicPrompt = {
  number: string; slug: string; title: string; category: string; short: string; description: string;
  bestFor: string; tools: string[]; tutorial: string[]; download: string; promptText: string;
};

export type PublicLesson = { id: string; slug: string; title: string; summary: string; bodyMarkdown: string; durationMinutes: number | null; videoUrl: string | null; repositoryUrl: string | null };
export type PublicModule = { id: string; title: string; summary: string; lessons: PublicLesson[] };
export type PublicLearningPath = { id: string; slug: string; title: string; summary: string; description: string; difficulty: string | null; estimatedDuration: string | null; modules: PublicModule[] };

export const getPublishedStudioCategories = cache(async (): Promise<StudioCategory[]> => {
  if (!hasSupabaseConfig()) return fallbackCategories;
  try {
    const { data, error } = await client().from('studio_categories').select('*').eq('published', true).order('sort_order');
    if (error || !data?.length) return fallbackCategories;
    return data.map((row) => ({
      slug: row.slug,
      href: row.href || `/barnx-studio/categories/${row.slug}`,
      icon: row.icon,
      meta: `${row.label} · ${row.access_type.toUpperCase()}`,
      title: row.title,
      short: row.description,
      action: row.action_label,
      access: row.access_type,
    }));
  } catch {
    return fallbackCategories;
  }
});

function fallbackResource(resource: (typeof fallbackResources)[number]): PublicStudioResource {
  return { ...resource, externalUrl: undefined };
}

function mapStudioResource(row: Record<string, any>): PublicStudioResource {
  return {
    slug: row.slug,
    title: row.title,
    type: row.resource_type.replaceAll('_', ' '),
    icon: row.icon,
    free: row.is_free,
    short: row.short_summary,
    description: row.description,
    includes: row.includes,
    bestFor: row.best_for,
    tech: row.technologies,
    download: row.download_path ?? undefined,
    externalUrl: row.external_url ?? undefined,
  };
}

export const getPublishedStudioResources = cache(async (): Promise<PublicStudioResource[]> => {
  if (!hasSupabaseConfig()) return fallbackResources.map(fallbackResource);
  try {
    const { data, error } = await client().from('studio_resources').select('*').eq('published', true).order('featured', { ascending: false }).order('sort_order');
    if (error) throw error;
    const cms = (data ?? []).map(mapStudioResource);
    const cmsSlugs = new Set(cms.map((item) => item.slug));
    return [...cms, ...fallbackResources.filter((item) => !cmsSlugs.has(item.slug)).map(fallbackResource)];
  } catch { return fallbackResources.map(fallbackResource); }
});

export const getPublishedStudioResource = cache(async (slug: string) => (await getPublishedStudioResources()).find((item) => item.slug === slug) ?? null);

export const getPublishedStudioCategory = cache(async (slug: string) =>
  (await getPublishedStudioCategories()).find((item) => item.slug === slug) ?? null,
);

export async function getPublishedStudioResourcesForCategory(
  categorySlug: string,
  fallbackSlugs: string[] = [],
): Promise<PublicStudioResource[]> {
  const fallback = fallbackResources
    .filter((item) => fallbackSlugs.includes(item.slug))
    .map(fallbackResource);

  if (!hasSupabaseConfig()) return fallback;

  try {
    const db = client();
    const { data: category, error: categoryError } = await db
      .from('studio_categories')
      .select('id')
      .eq('slug', categorySlug)
      .eq('published', true)
      .maybeSingle();

    if (categoryError || !category) return fallback;

    const { data, error } = await db
      .from('studio_resources')
      .select('*')
      .eq('category_id', category.id)
      .eq('published', true)
      .order('featured', { ascending: false })
      .order('sort_order');

    if (error) return fallback;

    const cms = (data ?? []).map(mapStudioResource);
    const cmsSlugs = new Set(cms.map((item) => item.slug));
    return [...cms, ...fallback.filter((item) => !cmsSlugs.has(item.slug))];
  } catch {
    return fallback;
  }
}

export const getPublishedPrompts = cache(async (): Promise<PublicPrompt[]> => {
  if (!hasSupabaseConfig()) return fallbackPrompts.map((item) => ({ ...item, promptText: '' }));
  try {
    const { data, error } = await client().from('prompt_resources').select('*').eq('published', true).order('featured', { ascending: false }).order('sort_order');
    if (error) throw error;
    const cms = (data ?? []).map((row) => ({ number: row.number_label, slug: row.slug, title: row.title, category: row.category, short: row.short_summary, description: row.description, bestFor: row.best_for, tools: row.tools, tutorial: row.tutorial_steps, download: row.download_path ?? '', promptText: row.prompt_text ?? '' }));
    const cmsSlugs = new Set(cms.map((item) => item.slug));
    return [...cms, ...fallbackPrompts.filter((item) => !cmsSlugs.has(item.slug)).map((item) => ({ ...item, promptText: '' }))];
  } catch { return fallbackPrompts.map((item) => ({ ...item, promptText: '' })); }
});

export const getPublishedPrompt = cache(async (slug: string) => (await getPublishedPrompts()).find((item) => item.slug === slug) ?? null);

export const getPublishedLearningPaths = cache(async (): Promise<PublicLearningPath[]> => {
  if (!hasSupabaseConfig()) return [];
  try {
    const db = client();
    const { data: paths, error } = await db.from('learning_paths').select('*').eq('published', true).order('featured', { ascending: false }).order('sort_order');
    if (error || !paths?.length) return [];
    const pathIds = paths.map((path) => path.id);
    const { data: modules } = await db.from('learning_modules').select('*').in('learning_path_id', pathIds).eq('published', true).order('sort_order');
    const moduleIds = (modules ?? []).map((module) => module.id);
    const { data: lessons } = moduleIds.length ? await db.from('learning_lessons').select('*').in('learning_module_id', moduleIds).eq('published', true).order('sort_order') : { data: [] };
    return paths.map((path) => ({
      id: path.id, slug: path.slug, title: path.title, summary: path.summary, description: path.description,
      difficulty: path.difficulty, estimatedDuration: path.estimated_duration,
      modules: (modules ?? []).filter((module) => module.learning_path_id === path.id).map((module) => ({
        id: module.id, title: module.title, summary: module.summary,
        lessons: (lessons ?? []).filter((lesson) => lesson.learning_module_id === module.id).map((lesson) => ({ id: lesson.id, slug: lesson.slug, title: lesson.title, summary: lesson.summary, bodyMarkdown: lesson.body_markdown, durationMinutes: lesson.duration_minutes, videoUrl: lesson.video_url, repositoryUrl: lesson.repository_url })),
      })),
    }));
  } catch { return []; }
});

export const getPublishedLearningPath = cache(async (slug: string) => (await getPublishedLearningPaths()).find((path) => path.slug === slug) ?? null);
