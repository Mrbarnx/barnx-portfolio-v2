export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://barnx-portfolio-v2.vercel.app';

export type PublicSiteSettings = {
  headline: string;
  availability: string;
  email: string;
  github: string;
  linkedin: string;
  x: string;
  tiktok: string;
  location: string;
  resumeUrl: string;
  seoTitle: string;
  seoDescription: string;
};

export const site = {
  name: 'Barnx',
  person: 'Barnabas Mikel',
  title: 'Barnx — Barnabas Mikel',
  description:
    'Frontend-Focused Full-Stack Engineer building modern web applications while integrating AI-powered features and intelligent automations.',
  shortDescription:
    'Frontend-focused product engineering, AI integrations and intelligent automations.',
  email: 'mrbarnx@gmail.com',
  url: siteUrl,
  github: 'https://github.com/Mrbarnx',
  linkedin: 'https://www.linkedin.com/in/mrbarns',
  x: 'https://x.com/MRBARNX',
};
