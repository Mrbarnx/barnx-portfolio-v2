import 'server-only';

import { cache } from 'react';
import { unstable_noStore as noStore } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { projects as fallbackProjects, type Project } from '@/data/content';
import { getSupabaseConfig } from '@/lib/supabase/config';
import { mediaPublicUrl } from '@/lib/admin/media';

type PublicProjectRow = {
  id: string;
  slug: string;
  title: string;
  display_title: string;
  category: string;
  status: string;
  short_summary: string;
  overview: string;
  visual_subtitle: string;
  tone: string;
  problem: string;
  solution: string;
  role: string;
  features: string[];
  technologies: string[];
  challenges: string;
  lessons: string;
  live_url: string | null;
  github_url: string | null;
  featured: boolean;
};

const publicProjectFields = 'id,slug,title,display_title,category,status,short_summary,overview,visual_subtitle,tone,problem,solution,role,features,technologies,challenges,lessons,live_url,github_url,featured';

const statusLabels: Record<string, string> = {
  in_development: 'In development',
  public_build: 'Public build',
  private_demo: 'Private demo',
  completed: 'Completed',
};

type ProjectCover = { url: string; alt: string };

function mapProject(row: PublicProjectRow, coverImage?: ProjectCover): Project {
  return {
    slug: row.slug,
    title: row.title,
    display: row.display_title,
    category: row.category,
    status: statusLabels[row.status] ?? row.status,
    short: row.short_summary,
    overview: row.overview,
    visualSubtitle: row.visual_subtitle,
    tone: row.tone,
    problem: row.problem,
    solution: row.solution,
    role: row.role,
    features: row.features,
    tech: row.technologies,
    challenges: row.challenges,
    lessons: row.lessons,
    live: row.live_url ?? undefined,
    github: row.github_url ?? undefined,
    coverImage,
  };
}

async function loadProjectCovers(client: ReturnType<typeof publicClient>, projectIds: string[]) {
  const covers = new Map<string, ProjectCover>();
  if (!projectIds.length) return covers;

  const { data: links, error: linksError } = await client
    .from('project_media')
    .select('project_id,media_id')
    .eq('usage', 'cover')
    .in('project_id', projectIds);
  if (linksError || !links?.length) return covers;

  const mediaIds = [...new Set(links.map((link) => link.media_id))];
  const { data: assets, error: assetsError } = await client
    .from('media_assets')
    .select('id,storage_path,alt_text')
    .eq('is_public', true)
    .in('id', mediaIds);
  if (assetsError || !assets) return covers;

  const { url } = getSupabaseConfig();
  const assetsById = new Map(assets.map((asset) => [asset.id, asset]));
  links.forEach((link) => {
    const asset = assetsById.get(link.media_id);
    if (asset) covers.set(link.project_id, { url: mediaPublicUrl(url, asset.storage_path), alt: asset.alt_text });
  });
  return covers;
}

function publicClient() {
  const { url, anonKey } = getSupabaseConfig();
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

export const getPublishedProjects = cache(async (): Promise<Project[]> => {
  noStore();

  try {
    const client = publicClient();
    const { data, error } = await client
      .from('projects')
      .select(publicProjectFields)
      .eq('published', true)
      .neq('status', 'archived')
      .order('featured', { ascending: false })
      .order('sort_order', { ascending: true })
      .order('published_at', { ascending: false });

    if (error) throw error;
    const rows = (data ?? []) as unknown as PublicProjectRow[];
    const covers = await loadProjectCovers(client, rows.map((row) => row.id));
    return rows.map((row) => mapProject(row, covers.get(row.id)));
  } catch (error) {
    console.error('Published projects fallback activated:', error instanceof Error ? error.message : 'Unknown Supabase error');
    return fallbackProjects;
  }
});

export const getPublishedProject = cache(async (slug: string): Promise<Project | null> => {
  noStore();

  try {
    const client = publicClient();
    const { data, error } = await client
      .from('projects')
      .select(publicProjectFields)
      .eq('slug', slug)
      .eq('published', true)
      .neq('status', 'archived')
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    const row = data as unknown as PublicProjectRow;
    const covers = await loadProjectCovers(client, [row.id]);
    return mapProject(row, covers.get(row.id));
  } catch (error) {
    console.error('Published project fallback activated:', error instanceof Error ? error.message : 'Unknown Supabase error');
    return fallbackProjects.find((project) => project.slug === slug) ?? null;
  }
});
