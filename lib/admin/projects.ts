import { z } from 'zod';

export const projectStatuses = [
  ['in_development', 'In development'],
  ['public_build', 'Public build'],
  ['private_demo', 'Private demo'],
  ['completed', 'Completed'],
  ['archived', 'Archived'],
] as const;

export const projectTones = [
  ['light', 'Light'],
  ['gray', 'Gray'],
  ['black', 'Black'],
] as const;

const optionalUrl = z.string().trim().refine(
  (value) => !value || z.string().url().safeParse(value).success,
  'Enter a complete URL beginning with https://',
);

const optionalHttpsUrl = z.string().trim().refine((value) => {
  if (!value) return true;
  const parsed = z.string().url().safeParse(value);
  return parsed.success && new URL(value).protocol === 'https:';
}, 'Enter a secure URL beginning with https://');

const mediaId = z.string().uuid('Choose a valid Media Library image.');

export const projectFormSchema = z.object({
  title: z.string().trim().min(2, 'Enter a project title.'),
  display_title: z.string().trim().min(1, 'Enter the short display title.'),
  slug: z.string().trim().min(2, 'Enter a slug.').regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Use lowercase letters, numbers and hyphens only.',
  ),
  category: z.string().trim().min(2, 'Enter a category.'),
  status: z.enum(['in_development', 'public_build', 'private_demo', 'completed', 'archived']),
  short_summary: z.string().trim().min(10, 'Add a short summary of at least 10 characters.'),
  overview: z.string().trim().min(10, 'Add an overview of at least 10 characters.'),
  visual_subtitle: z.string().trim(),
  tone: z.enum(['light', 'gray', 'black']),
  problem: z.string().trim().min(10, 'Describe the problem.'),
  solution: z.string().trim().min(10, 'Describe your solution.'),
  role: z.string().trim().min(2, 'Enter your role.'),
  features: z.string().trim(),
  technologies: z.string().trim(),
  challenges: z.string().trim(),
  lessons: z.string().trim(),
  live_url: optionalUrl,
  github_url: optionalUrl,
  sort_order: z.coerce.number().int().min(0).max(9999),
  featured: z.boolean(),
  cover_media_id: z.union([z.literal(''), mediaId]),
  gallery_media_ids: z.array(mediaId).max(24, 'Choose no more than 24 gallery images.'),
  video_poster_media_id: z.union([z.literal(''), mediaId]),
  demo_visibility: z.enum(['none', 'public', 'unlisted', 'private']),
  demo_video_url: optionalHttpsUrl,
  private_video_url: optionalHttpsUrl,
  demo_video_title: z.string().trim().max(100, 'Keep the video title under 100 characters.'),
}).superRefine((values, context) => {
  if (['public', 'unlisted'].includes(values.demo_visibility) && !values.demo_video_url) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['demo_video_url'], message: 'Add the external video URL.' });
  }
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;

export type ProjectRow = Omit<ProjectFormValues, 'features' | 'technologies' | 'cover_media_id' | 'gallery_media_ids' | 'video_poster_media_id' | 'private_video_url'> & {
  id: string;
  features: string[];
  technologies: string[];
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ProjectActionState = {
  error: string | null;
  fieldErrors: Record<string, string[]>;
};

export const initialProjectActionState: ProjectActionState = {
  error: null,
  fieldErrors: {},
};

export function projectFormData(formData: FormData) {
  let galleryMediaIds: string[] = [];
  try {
    const parsed = JSON.parse(String(formData.get('gallery_media_ids') ?? '[]'));
    if (Array.isArray(parsed)) galleryMediaIds = [...new Set(parsed.map(String))];
  } catch {
    galleryMediaIds = [];
  }

  return {
    title: formData.get('title'),
    display_title: formData.get('display_title'),
    slug: formData.get('slug'),
    category: formData.get('category'),
    status: formData.get('status'),
    short_summary: formData.get('short_summary'),
    overview: formData.get('overview'),
    visual_subtitle: formData.get('visual_subtitle'),
    tone: formData.get('tone'),
    problem: formData.get('problem'),
    solution: formData.get('solution'),
    role: formData.get('role'),
    features: formData.get('features'),
    technologies: formData.get('technologies'),
    challenges: formData.get('challenges'),
    lessons: formData.get('lessons'),
    live_url: formData.get('live_url'),
    github_url: formData.get('github_url'),
    sort_order: formData.get('sort_order'),
    featured: formData.get('featured') === 'on',
    cover_media_id: String(formData.get('cover_media_id') ?? ''),
    gallery_media_ids: galleryMediaIds,
    video_poster_media_id: String(formData.get('video_poster_media_id') ?? ''),
    demo_visibility: formData.get('demo_visibility'),
    demo_video_url: String(formData.get('demo_video_url') ?? ''),
    private_video_url: String(formData.get('private_video_url') ?? ''),
    demo_video_title: String(formData.get('demo_video_title') ?? ''),
  };
}

export function splitList(value: string) {
  return value
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function statusLabel(status: string) {
  return projectStatuses.find(([value]) => value === status)?.[1] ?? status;
}
