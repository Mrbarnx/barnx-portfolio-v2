import type { MetadataRoute } from 'next';
import { projects } from '@/data/content';
import { site } from '@/data/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    '',
    '/projects',
    '/impact',
    '/barnx-studio',
    '/barnx-studio/prompts',
    '/barnx-studio/open-source-assets',
    '/barnx-studio/ui-lab',
    '/barnx-studio/learning-paths',
    '/barnx-studio/learning-paths/docker-fundamentals',
    '/barnx-studio/automation-blueprints',
    '/barnx-studio/automation-systems',
    '/barnx-studio/visual-assets',
  ];

  const pages: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: `${site.url}${path}`,
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : path === '/projects' || path === '/barnx-studio' ? 0.9 : 0.7,
  }));

  const projectPages: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${site.url}/projects/${project.slug}`,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [...pages, ...projectPages];
}
