export type StudioCategory = {
  slug: string;
  href: string;
  icon: string;
  meta: string;
  title: string;
  short: string;
  action: string;
  access: 'free' | 'premium' | 'mixed';
};

export const studioCategories: StudioCategory[] = [
  { slug: 'prompt-library', href: '/barnx-studio/prompts', icon: '✦', meta: 'Prompt Library · FREE', title: 'AI Prompt Library', short: 'Practical prompts and engineering frameworks you can understand, copy, adapt and use.', action: 'Explore prompts →', access: 'free' },
  { slug: 'open-source-assets', href: '/barnx-studio/open-source-assets', icon: '⌘', meta: 'Open Source · FREE', title: 'Open Source Assets', short: 'Reusable developer code, components and practical assets you can inspect, adapt and use.', action: 'Explore assets →', access: 'free' },
  { slug: 'ui-lab', href: '/barnx-studio/ui-lab', icon: '◫', meta: 'UI Lab · FREE', title: 'Barnx UI Lab', short: 'Website, app and interface demos with build prompts and short tutorials to help you recreate them.', action: 'Explore UI Lab →', access: 'free' },
  { slug: 'learning-paths', href: '/barnx-studio/learning-paths', icon: '↗', meta: 'Learning Paths · FREE', title: 'Learning Paths', short: 'Curated resources, Barnx notes and practical learning steps for skills I am actively learning and applying.', action: 'Explore learning paths →', access: 'free' },
  { slug: 'automation-blueprints', href: '/barnx-studio/automation-blueprints', icon: '⚡', meta: 'Automation · FREE', title: 'Automation Blueprints', short: 'Practical workflow blueprints for lead handling, operations and repeatable business automation.', action: 'Explore blueprints →', access: 'free' },
  { slug: 'visual-assets', href: '/barnx-studio/visual-assets', icon: '◇', meta: 'Visual Assets · FREE', title: 'Visual Assets', short: 'A growing home for reusable 3D, motion and design assets for modern interfaces.', action: 'Explore visual assets →', access: 'free' },
  { slug: 'saas-starter-system', href: '/barnx-studio/saas-starter-system', icon: '□', meta: 'Template · PREMIUM', title: 'SaaS Starter System', short: 'Future premium starter for polished SaaS product foundations.', action: 'View resource →', access: 'premium' },
];
