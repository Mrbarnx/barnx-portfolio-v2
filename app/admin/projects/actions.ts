'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { projects as fileProjects } from '@/data/content';
import { requireCmsAdmin } from '@/lib/admin/requireCmsAdmin';
import {
  projectFormData,
  projectFormSchema,
  splitList,
  type ProjectActionState,
} from '@/lib/admin/projects';

function validationState(error: ReturnType<typeof projectFormSchema.safeParse>) {
  if (error.success) return null;
  return {
    error: 'Please correct the highlighted fields.',
    fieldErrors: error.error.flatten().fieldErrors as Record<string, string[]>,
  } satisfies ProjectActionState;
}

function databaseMessage(message: string) {
  if (message.includes('projects_slug_key')) return 'That slug is already used by another project.';
  return 'The project could not be saved. Please try again.';
}

function revalidatePublicProjects(slug?: string, previousSlug?: string) {
  revalidatePath('/');
  revalidatePath('/projects');
  revalidatePath('/sitemap.xml');
  if (slug) revalidatePath(`/projects/${slug}`);
  if (previousSlug && previousSlug !== slug) revalidatePath(`/projects/${previousSlug}`);
}

function toPayload(values: ReturnType<typeof projectFormSchema.parse>, userId?: string) {
  const {
    cover_media_id: _coverMediaId,
    gallery_media_ids: _galleryMediaIds,
    video_poster_media_id: _videoPosterMediaId,
    private_video_url: _privateVideoUrl,
    ...projectValues
  } = values;
  return {
    ...projectValues,
    features: splitList(values.features),
    technologies: splitList(values.technologies),
    live_url: values.live_url || null,
    github_url: values.github_url || null,
    demo_video_url: ['public', 'unlisted'].includes(values.demo_visibility) ? values.demo_video_url : null,
    ...(userId ? { created_by: userId } : {}),
  };
}

type MediaSelection = { mediaId: string; usage: 'cover' | 'screenshot' | 'video'; sortOrder: number };

async function syncProjectMedia(
  supabase: Awaited<ReturnType<typeof requireCmsAdmin>>['supabase'],
  projectId: string,
  selections: MediaSelection[],
) {
  const mediaIds = [...new Set(selections.map((selection) => selection.mediaId).filter(Boolean))];
  if (mediaIds.length) {
    const { data: assets, error: assetError } = await supabase
      .from('media_assets')
      .select('id')
      .eq('is_public', true)
      .in('id', mediaIds);
    if (assetError || (assets?.length ?? 0) !== mediaIds.length) return 'One or more selected images are unavailable.';
  }

  const { data: existing, error: existingError } = await supabase
    .from('project_media')
    .select('media_id,usage')
    .eq('project_id', projectId)
    .in('usage', ['cover', 'screenshot', 'video']);
  if (existingError) return 'The current project media could not be read.';

  if (selections.length) {
    const { error: upsertError } = await supabase.from('project_media').upsert(
      selections.map((selection) => ({
        project_id: projectId,
        media_id: selection.mediaId,
        usage: selection.usage,
        sort_order: selection.sortOrder,
      })),
      { onConflict: 'project_id,media_id,usage' },
    );
    if (upsertError) return 'The selected project media could not be attached.';
  }

  const wanted = new Set(selections.map((selection) => `${selection.usage}:${selection.mediaId}`));
  for (const link of existing ?? []) {
    if (wanted.has(`${link.usage}:${link.media_id}`)) continue;
    const { error: deleteError } = await supabase
      .from('project_media')
      .delete()
      .eq('project_id', projectId)
      .eq('media_id', link.media_id)
      .eq('usage', link.usage);
    if (deleteError) return 'An old project media link could not be removed.';
  }

  return null;
}

async function syncPrivateDemo(
  supabase: Awaited<ReturnType<typeof requireCmsAdmin>>['supabase'],
  projectId: string,
  visibility: string,
  videoUrl: string,
  userId: string,
) {
  if (visibility === 'private' && videoUrl) {
    const { error } = await supabase.from('project_private_demos').upsert({
      project_id: projectId,
      video_url: videoUrl,
      updated_by: userId,
    });
    return error ? 'the private demo link could not be saved.' : null;
  }

  const { error } = await supabase.from('project_private_demos').delete().eq('project_id', projectId);
  return error ? 'the previous private demo link could not be removed.' : null;
}

function mediaSelections(values: ReturnType<typeof projectFormSchema.parse>): MediaSelection[] {
  return [
    ...(values.cover_media_id ? [{ mediaId: values.cover_media_id, usage: 'cover' as const, sortOrder: 0 }] : []),
    ...values.gallery_media_ids.map((mediaId, index) => ({ mediaId, usage: 'screenshot' as const, sortOrder: index })),
    ...(['public', 'unlisted'].includes(values.demo_visibility) && values.video_poster_media_id
      ? [{ mediaId: values.video_poster_media_id, usage: 'video' as const, sortOrder: 0 }]
      : []),
  ];
}

export async function createProject(
  _previousState: ProjectActionState,
  formData: FormData,
): Promise<ProjectActionState> {
  const parsed = projectFormSchema.safeParse(projectFormData(formData));
  const invalid = validationState(parsed);
  if (invalid || !parsed.success) return invalid!;

  const { supabase, user } = await requireCmsAdmin();
  const published = formData.get('intent') === 'publish' && parsed.data.status !== 'archived';
  const { data: project, error } = await supabase
    .from('projects')
    .insert({ ...toPayload(parsed.data, user.id), published })
    .select('id')
    .single();

  if (error) return { error: databaseMessage(error.message), fieldErrors: {} };
  const mediaError = await syncProjectMedia(supabase, project.id, mediaSelections(parsed.data));
  if (mediaError) return { error: `Project saved, but ${mediaError}`, fieldErrors: {} };
  const privateDemoError = await syncPrivateDemo(supabase, project.id, parsed.data.demo_visibility, parsed.data.private_video_url, user.id);
  if (privateDemoError) return { error: `Project saved, but ${privateDemoError}`, fieldErrors: {} };

  revalidatePath('/admin');
  revalidatePath('/admin/projects');
  revalidatePublicProjects(parsed.data.slug);
  redirect(`/admin/projects?created=${published ? 'published' : 'draft'}`);
}

export async function updateProject(
  id: string,
  _previousState: ProjectActionState,
  formData: FormData,
): Promise<ProjectActionState> {
  const parsed = projectFormSchema.safeParse(projectFormData(formData));
  const invalid = validationState(parsed);
  if (invalid || !parsed.success) return invalid!;

  const { supabase, user } = await requireCmsAdmin();
  const { data: current } = await supabase.from('projects').select('slug').eq('id', id).maybeSingle();
  const published = formData.get('intent') === 'publish' && parsed.data.status !== 'archived';
  const { error } = await supabase
    .from('projects')
    .update({ ...toPayload(parsed.data), published })
    .eq('id', id);

  if (error) return { error: databaseMessage(error.message), fieldErrors: {} };
  const mediaError = await syncProjectMedia(supabase, id, mediaSelections(parsed.data));
  if (mediaError) return { error: `Project content saved, but ${mediaError}`, fieldErrors: {} };
  const privateDemoError = await syncPrivateDemo(supabase, id, parsed.data.demo_visibility, parsed.data.private_video_url, user.id);
  if (privateDemoError) return { error: `Project content saved, but ${privateDemoError}`, fieldErrors: {} };

  revalidatePath('/admin');
  revalidatePath('/admin/projects');
  revalidatePath(`/admin/projects/${id}/edit`);
  revalidatePublicProjects(parsed.data.slug, current?.slug);
  redirect(`/admin/projects/${id}/edit?saved=${published ? 'published' : 'draft'}`);
}

export async function setProjectPublished(formData: FormData) {
  const id = String(formData.get('id') ?? '');
  const published = formData.get('published') === 'true';
  if (!id) return;

  const { supabase } = await requireCmsAdmin();
  const { data: project } = await supabase.from('projects').select('slug').eq('id', id).maybeSingle();
  let query = supabase.from('projects').update({ published }).eq('id', id);
  if (published) query = query.neq('status', 'archived');
  const { error } = await query;
  revalidatePath('/admin/projects');
  revalidatePublicProjects(project?.slug);
  redirect(`/admin/projects?visibility=${error ? 'failed' : published ? 'published' : 'draft'}`);
}

export async function archiveProject(formData: FormData) {
  const id = String(formData.get('id') ?? '');
  if (!id) return;

  const { supabase } = await requireCmsAdmin();
  const { data: project } = await supabase.from('projects').select('slug').eq('id', id).maybeSingle();
  await supabase
    .from('projects')
    .update({ status: 'archived', published: false, featured: false })
    .eq('id', id);

  revalidatePath('/admin');
  revalidatePath('/admin/projects');
  revalidatePublicProjects(project?.slug);
  redirect('/admin/projects?archived=true');
}

export async function restoreProject(formData: FormData) {
  const id = String(formData.get('id') ?? '');
  if (!id) return;

  const { supabase } = await requireCmsAdmin();
  const { data: project } = await supabase.from('projects').select('slug').eq('id', id).maybeSingle();
  const { error } = await supabase
    .from('projects')
    .update({ status: 'public_build', published: false })
    .eq('id', id)
    .eq('status', 'archived');

  revalidatePath('/admin');
  revalidatePath('/admin/projects');
  revalidatePath(`/admin/projects/${id}/edit`);
  revalidatePublicProjects(project?.slug);
  redirect(`/admin/projects/${id}/edit?restored=${error ? 'failed' : 'true'}`);
}

export async function importCurrentProjects() {
  const { supabase, user } = await requireCmsAdmin();
  const { data: existing, error: readError } = await supabase.from('projects').select('slug');
  if (readError) redirect('/admin/projects?import=failed');

  const existingSlugs = new Set((existing ?? []).map((project) => project.slug));
  const missing = fileProjects.filter((project) => !existingSlugs.has(project.slug));

  if (!missing.length) redirect('/admin/projects?import=unchanged');

  const rows = missing.map((project, index) => ({
    slug: project.slug,
    title: project.title,
    display_title: project.display,
    category: project.category,
    status: 'public_build',
    short_summary: project.short,
    overview: project.overview,
    visual_subtitle: project.visualSubtitle,
    tone: project.tone,
    problem: project.problem,
    solution: project.solution,
    role: project.role,
    features: project.features,
    technologies: project.tech,
    challenges: project.challenges,
    lessons: project.lessons,
    live_url: project.live ?? null,
    github_url: project.github ?? null,
    featured: false,
    published: true,
    sort_order: index,
    created_by: user.id,
  }));

  const { error } = await supabase.from('projects').insert(rows);
  if (error) redirect('/admin/projects?import=failed');

  revalidatePath('/admin');
  revalidatePath('/admin/projects');
  revalidatePublicProjects();
  redirect(`/admin/projects?import=${rows.length}`);
}
