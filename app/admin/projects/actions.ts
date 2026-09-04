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
  return {
    ...values,
    features: splitList(values.features),
    technologies: splitList(values.technologies),
    live_url: values.live_url || null,
    github_url: values.github_url || null,
    ...(userId ? { created_by: userId } : {}),
  };
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
  const { error } = await supabase.from('projects').insert({
    ...toPayload(parsed.data, user.id),
    published,
  });

  if (error) return { error: databaseMessage(error.message), fieldErrors: {} };

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

  const { supabase } = await requireCmsAdmin();
  const { data: current } = await supabase.from('projects').select('slug').eq('id', id).maybeSingle();
  const published = formData.get('intent') === 'publish' && parsed.data.status !== 'archived';
  const { error } = await supabase
    .from('projects')
    .update({ ...toPayload(parsed.data), published })
    .eq('id', id);

  if (error) return { error: databaseMessage(error.message), fieldErrors: {} };

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
