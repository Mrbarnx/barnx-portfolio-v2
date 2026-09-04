import 'server-only';

import { cache } from 'react';
import { unstable_noStore as noStore } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { projects as fallbackProjects, type Project, type ProjectImage } from '@/data/content';
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
  demo_visibility: 'none' | 'public' | 'unlisted' | 'private';
  demo_video_url: string | null;
  demo_video_title: string;
};

const publicProjectFields = 'id,slug,title,display_title,category,status,short_summary,overview,visual_subtitle,tone,problem,solution,role,features,technologies,challenges,lessons,live_url,github_url,featured,demo_visibility,demo_video_url,demo_video_title';

const statusLabels: Record<string, string> = {
  in_development: 'In development',
  public_build: 'Public build',
  private_demo: 'Private demo',
  completed: 'Completed',
};

type ProjectMedia = { cover?: ProjectImage; gallery: ProjectImage[]; poster?: ProjectImage };

function mapProject(row: PublicProjectRow, media?: ProjectMedia): Project {
  const video = row.demo_visibility === 'private'
    ? { visibility: 'private' as const, title: row.demo_video_title || 'Request private demo' }
    : ['public', 'unlisted'].includes(row.demo_visibility) && row.demo_video_url
      ? {
          visibility: row.demo_visibility as 'public' | 'unlisted',
          url: row.demo_video_url,
          title: row.demo_video_title || 'Watch video',
          poster: media?.poster ?? media?.cover,
        }
      : undefined;

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
    coverImage: media?.cover,
    galleryImages: media?.gallery,
    video,
  };
}

async function loadProjectMedia(client: ReturnType<typeof publicClient>, projectIds: string[]) {
  const media = new Map<string, ProjectMedia>();
  if (!projectIds.length) return media;

  const { data: links, error: linksError } = await client
    .from('project_media')
    .select('project_id,media_id,usage,sort_order')
    .in('usage', ['cover', 'screenshot', 'video'])
    .in('project_id', projectIds)
    .order('sort_order', { ascending: true });
  if (linksError || !links?.length) return media;

  const mediaIds = [...new Set(links.map((link) => link.media_id))];
  const { data: assets, error: assetsError } = await client
    .from('media_assets')
    .select('id,storage_path,alt_text,caption')
    .eq('is_public', true)
    .in('id', mediaIds);
  if (assetsError || !assets) return media;

  const { url } = getSupabaseConfig();
  const assetsById = new Map(assets.map((asset) => [asset.id, asset]));
  links.forEach((link) => {
    const asset = assetsById.get(link.media_id);
    if (!asset) return;
    const image = {
      id: asset.id,
      url: mediaPublicUrl(url, asset.storage_path),
      alt: asset.alt_text,
      ...(asset.caption ? { caption: asset.caption } : {}),
    };
    const current = media.get(link.project_id) ?? { gallery: [] };
    if (link.usage === 'cover') current.cover = image;
    if (link.usage === 'screenshot') current.gallery.push(image);
    if (link.usage === 'video') current.poster = image;
    media.set(link.project_id, current);
  });
  return media;
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
    const media = await loadProjectMedia(client, rows.map((row) => row.id));
    return rows.map((row) => mapProject(row, media.get(row.id)));
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
    const media = await loadProjectMedia(client, [row.id]);
    return mapProject(row, media.get(row.id));
  } catch (error) {
    console.error('Published project fallback activated:', error instanceof Error ? error.message : 'Unknown Supabase error');
    return fallbackProjects.find((project) => project.slug === slug) ?? null;
  }
});
