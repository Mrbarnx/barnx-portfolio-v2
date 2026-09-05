import 'server-only';

import { cache } from 'react';
import { createClient } from '@supabase/supabase-js';
import { site, type PublicSiteSettings } from '@/data/site';
import { getSupabaseConfig, hasSupabaseConfig } from '@/lib/supabase/config';

export const defaultSiteSettings: PublicSiteSettings = {
  headline: 'Frontend-Focused Full-Stack Engineer building modern web applications while integrating AI-powered features and intelligent automations.',
  availability: 'Available for new opportunities',
  email: site.email,
  github: site.github,
  linkedin: site.linkedin,
  x: site.x,
  tiktok: 'https://tiktok.com/@mrbarnx',
  location: 'Remote · Nigeria',
  resumeUrl: '/Barnabas-Mikel-Resume.pdf',
  seoTitle: site.title,
  seoDescription: site.description,
};

export const getPublicSiteSettings = cache(async (): Promise<PublicSiteSettings> => {
  if (!hasSupabaseConfig()) return defaultSiteSettings;
  try {
    const { url, anonKey } = getSupabaseConfig();
    const client = createClient(url, anonKey, { auth: { persistSession: false } });
    const { data, error } = await client.from('site_settings').select('value').eq('key', 'site.profile').eq('is_public', true).maybeSingle();
    if (error || !data?.value || typeof data.value !== 'object') return defaultSiteSettings;
    return { ...defaultSiteSettings, ...(data.value as Partial<PublicSiteSettings>) };
  } catch {
    return defaultSiteSettings;
  }
});
